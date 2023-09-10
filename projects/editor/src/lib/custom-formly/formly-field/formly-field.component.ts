import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { FormlyConfig, FormlyField, FormlyFieldTemplates } from '@ngx-formly/core';
import { filter, Subject, takeUntil } from 'rxjs';

import { EditorService } from '../../editor.service';
import { FieldOption, IEditorFieldInfo, IEditorFormlyField } from '../../editor.types';
import { selectActiveField, selectActiveForm } from '../../state/state.selectors';
import { IEditorState } from '../../state/state.types';
import { isCategoryOption, isTypeOption } from '../../editor.utils';

@Component({
    selector: 'editor-root-formly-field',
    template: '<ng-template #container></ng-template>',
})
export class RootFormlyFieldComponent extends FormlyField {}

@Component({
    selector: 'editor-formly-field',
    templateUrl: './formly-field.component.html',
    styleUrls: ['./formly-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyFieldComponent extends FormlyField implements OnInit, OnDestroy {
    @Input() override field: IEditorFormlyField;
    @Input() public index: number;
    @Input() public isFirstChild: boolean;
    @Input() public isLastChild: boolean;

    @HostBinding('class.edit-mode') isEditMode: boolean;
    @HostBinding('class.active') isActiveField: boolean;

    public isMouseInside: boolean;
    public hideOptions: boolean;
    public fieldInfo: IEditorFieldInfo;
    public fieldOptions: FieldOption[];

    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _cdRef: ChangeDetectorRef,
        private _store: Store<IEditorState>,
        config: FormlyConfig,
        renderer: Renderer2,
        elementRef: ElementRef,
        hostContainerRef: ViewContainerRef,
        @Optional() form: FormlyFieldTemplates
    ) {
        super(config, renderer, elementRef, hostContainerRef, form);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this._editorService.setActiveField(this.fieldInfo.fieldId);
        event.stopPropagation();
    }

    @HostListener('mouseover', ['$event'])
    onMouseOver(event: MouseEvent): void {
        this.isMouseInside = true;
        event.stopPropagation();
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(): void {
        this.isMouseInside = false;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.fieldInfo = this.field._info;

        this.hideOptions = this.field.templateOptions.hideEditorWrapperOptions;
        this.fieldOptions = this._editorService.fieldOptions;

        this._store
            .select(selectActiveForm)
            .pipe(
                takeUntil(this._destroy$),
                filter(form => form && form.id === this.fieldInfo.formId)
            )
            .subscribe(form => {
                this.isEditMode = form.isEditMode;
                this._cdRef.markForCheck();
            });

        this._store
            .select(selectActiveField)
            .pipe(
                takeUntil(this._destroy$),
                filter(field => field && field._info.formId === this.fieldInfo.formId)
            )
            .subscribe(field => {
                this.isActiveField = field?._info.fieldId === this.fieldInfo.fieldId;
                this._cdRef.markForCheck();
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroy$.next();
        this._destroy$.complete();
    }

    addField = (type: string) => this._editorService.addField(type, this.fieldInfo.fieldId);
    replaceField = (type: string) => this._editorService.replaceField(type, this.fieldInfo.fieldId);

    onRemove(): void {
        this._editorService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onMoveUp(): void {
        this._editorService.moveField(this.fieldInfo.fieldId, this.index, this.index - 1);
    }

    onMoveDown(): void {
        this._editorService.moveField(this.fieldInfo.fieldId, this.index, this.index + 1);
    }
}
