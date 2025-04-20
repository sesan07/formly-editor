import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { DndService, DragPreviewDirective, DragSourceDirective, DropTargetDirective } from '@ng-dnd/core';
import { Store } from '@ngrx/store';
import { FormlyConfig, FormlyField } from '@ngx-formly/core';
import { Observable, Subject, filter, map } from 'rxjs';

import { EditorService } from '../../editor.service';
import { DropAction, FieldOption, IEditorFieldInfo, IEditorFormlyField } from '../../editor.types';
import { getKeyPath, isCategoryOption, isTypeOption } from '../../editor.utils';
import { FieldDragDrop } from '../../field-drag-drop/field-drag-drop';
import { FieldDropOverlayComponent } from '../../field-drag-drop/field-drop-overlay/field-drop-overlay.component';
import { FieldNamePipe } from '../../field-name/field-name.pipe';
import { FormlyFieldTemplates } from '../formly.template';

@Component({
    selector: 'editor-root-formly-field',
    template: '<ng-template #container></ng-template>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class RootFormlyFieldComponent extends FormlyField {}

@Component({
    selector: 'editor-formly-field',
    templateUrl: './formly-field.component.html',
    styleUrls: ['./formly-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DragPreviewDirective,
        DragSourceDirective,
        DropTargetDirective,
        MatIconButton,
        MatMenuTrigger,
        MatIcon,
        FieldDropOverlayComponent,
        MatMenu,
        MatMenuContent,
        MatMenuItem,
        NgTemplateOutlet,
        AsyncPipe,
        FieldNamePipe,
    ]
})
export class FormlyFieldComponent extends FormlyField implements OnInit, OnDestroy {
    @Input() override field: IEditorFormlyField;
    @Input() public index: number;
    @Input() public isFirstChild: boolean;
    @Input() public isLastChild: boolean;

    public isEditMode$: Observable<boolean>;
    public isActiveField$: Observable<boolean>;

    public isMouseInside: boolean;
    public fieldInfo: IEditorFieldInfo;
    public fieldOptions: FieldOption[];

    public dnd: FieldDragDrop;

    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    private _editorField: IEditorFormlyField;

    constructor(
        private _editorService: EditorService,
        private _store: Store,
        private _dndService: DndService,
        private _ngZone: NgZone,
        config: FormlyConfig,
        renderer: Renderer2,
        elementRef: ElementRef,
        hostContainerRef: ViewContainerRef,
        @Optional() form: FormlyFieldTemplates
    ) {
        super(config, renderer, elementRef, hostContainerRef, form);
        this.dnd = new FieldDragDrop(DropAction.MOVE, this._editorService, this._dndService, this._ngZone, elementRef);
    }

    @HostBinding('attr.editor-hidden') get isHidden(): boolean {
        return !!this.field.props.hidden;
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

        this._editorField = this._editorService.getField(this.field._info.fieldId);
        this.fieldInfo = this._editorField._info;

        this.fieldOptions = this._editorService.fieldOptions;

        if (this.field.key) {
            this._editorService.registerKeyPath(this.field, getKeyPath(this.field.formControl));
        }

        const activeForm$ = this._store
            .select(this._editorService.feature.selectActiveForm)
            .pipe(filter(form => form?.id === this.fieldInfo.formId));
        this.isEditMode$ = activeForm$.pipe(map(form => form.isEditMode));
        this.isActiveField$ = activeForm$.pipe(map(form => form.activeFieldId === this.fieldInfo.fieldId));

        this.dnd.setup(this._editorField, this.index);
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroy$.next();
        this._destroy$.complete();
        this.dnd.destroy();
    }

    addField = (type: string) => this._editorService.addField(type, this.fieldInfo.fieldId);
    replaceField = (type: string) => this._editorService.replaceField(type, this.fieldInfo.fieldId);

    onRemove(): void {
        this._editorService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onMoveUp(): void {
        const sourceField: IEditorFormlyField = this._editorField;
        const sourceParent: IEditorFormlyField = this._editorService.getField(this.field._info.parentFieldId);
        this._editorService.moveField(sourceField, sourceParent, sourceParent, this.index, this.index - 1);
    }

    onMoveDown(): void {
        const sourceField: IEditorFormlyField = this._editorField;
        const sourceParent: IEditorFormlyField = this._editorService.getField(this.field._info.parentFieldId);
        this._editorService.moveField(sourceField, sourceParent, sourceParent, this.index, this.index + 2);
    }
}
