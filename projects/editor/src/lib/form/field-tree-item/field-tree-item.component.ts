import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    TrackByFunction,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '../../editor.service';
import { EditorTypeCategoryOption, IEditorFormlyField, IEditorFieldInfo } from '../../editor.types';
import { getFieldChildren, getFormattedFieldName, getReplaceCategories } from '../utils';
import { FormService } from '../form.service';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTreeItemComponent implements OnInit, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

    public isActiveField: boolean;
    public childFields: IEditorFormlyField[] = [];
    public replaceCategories: EditorTypeCategoryOption[];
    public fieldInfo: IEditorFieldInfo;

    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _formService: FormService,
        private _renderer: Renderer2,
        private _elementRef: ElementRef,
        private _cdRef: ChangeDetectorRef
    ) {}

    public get hasOptions(): boolean {
        return this.fieldInfo.canHaveChildren || this.treeLevel !== 0;
    }

    ngOnInit(): void {
        this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');

        this.fieldInfo = this.field._info;
        this.replaceCategories = getReplaceCategories(
            this.editorService.fieldCategories,
            this.field.type,
            this.field.customType
        );

        if (this.fieldInfo.canHaveChildren) {
            this.childFields = getFieldChildren(this.field);
        }

        this._formService.activeField$.pipe(takeUntil(this._destroy$)).subscribe((f: IEditorFormlyField) => {
            this.isActiveField = f._info.formId === this.fieldInfo.formId && f._info.fieldId === this.fieldInfo.fieldId;
            if (this.isActiveField) {
                this.expandParent.emit();
            }

            this._cdRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getFormattedFieldName = (f: IEditorFormlyField) => getFormattedFieldName(f);

    onAddChildField(type: string, customType?: string): void {
        if (this.fieldInfo.canHaveChildren) {
            this.isExpanded = true;
        }

        this._formService.addField(type, customType, this.fieldInfo.fieldId);
    }

    onRemoveChildField(childField: IEditorFormlyField): void {
        this._formService.removeField(childField._info.fieldId, this.fieldInfo.fieldId);
    }

    onReplaceParentField(type: string, customType?: string): void {
        this._formService.replaceParentField(type, this.fieldInfo.fieldId, customType);
    }

    onSelected(): void {
        this._formService.selectField(this.fieldInfo.fieldId);
    }

    onExpandParent(): void {
        this.isExpanded = true;
        this.expandParent.emit();
    }

    trackFieldById: TrackByFunction<IEditorFormlyField> = (_, field: IEditorFormlyField) => field._info.fieldId;
}
