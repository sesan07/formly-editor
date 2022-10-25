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
import { FormlyConfig, FormlyField, FormlyFieldTemplates } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';

import { EditorService } from '../../editor.service';
import { EditorTypeCategoryOption, IEditorFieldInfo, IEditorFormlyField } from '../../editor.types';
import { FormService } from '../../form/form.service';
import { getFieldChildren, getReplaceCategories } from '../../form/utils';

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

    public isMouseInside: boolean;
    public isFirstChild: boolean;
    public isLastChild: boolean;
    public index: number;
    public hideOptions: boolean;
    public fieldInfo: IEditorFieldInfo;
    public replaceCategories: EditorTypeCategoryOption[];

    private _isActiveField: boolean;
    private _isEditMode: boolean;
    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _formService: FormService,
        private _cdRef: ChangeDetectorRef,
        config: FormlyConfig,
        renderer: Renderer2,
        elementRef: ElementRef,
        hostContainerRef: ViewContainerRef,
        @Optional() form: FormlyFieldTemplates
    ) {
        super(config, renderer, elementRef, hostContainerRef, form);
    }

    @HostBinding('class.edit-mode') get isEditMode(): boolean {
        return this._isEditMode;
    }
    @HostBinding('class.active') get isActiveField(): boolean {
        return this._isActiveField;
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this._formService.selectField(this.fieldInfo.fieldId);
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
        if (this.fieldInfo.parentFieldId) {
            const parent: IEditorFormlyField = this._formService.getField(this.fieldInfo.parentFieldId);
            const siblings: IEditorFormlyField[] = getFieldChildren(parent);
            this.index = siblings.findIndex(f => f._info.fieldId === this.fieldInfo.fieldId);
            this.isFirstChild = this.index === 0;
            this.isLastChild = this.index === siblings.length - 1;
        } else {
            this.isFirstChild = this.isLastChild = true;
        }

        this.hideOptions = this.field.templateOptions.hideEditorWrapperOptions;
        this.replaceCategories = getReplaceCategories(
            this.editorService.fieldCategories,
            this.field.type,
            this.field.customType
        );

        this._formService.activeField$.pipe(takeUntil(this._destroy$)).subscribe(f => {
            this._isActiveField = f._info.fieldId === this.fieldInfo.fieldId;
            this._cdRef.markForCheck();
        });
        this._formService.isEditMode$.pipe(takeUntil(this._destroy$)).subscribe(v => {
            this._isEditMode = v;
            this._cdRef.markForCheck();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddChildField(type: string, customType?: string): void {
        this._formService.addField(type, customType, this.fieldInfo.fieldId);
    }

    onReplaceParentField(type: string, customType?: string): void {
        this._formService.replaceParentField(type, this.fieldInfo.fieldId, customType);
    }

    onRemove(): void {
        this._formService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onMoveUp(): void {
        this._formService.moveField(this.fieldInfo.fieldId, this.index, this.index - 1);
    }

    onMoveDown(): void {
        this._formService.moveField(this.fieldInfo.fieldId, this.index, this.index + 1);
    }
}
