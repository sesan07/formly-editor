import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TrackByFunction } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorService } from '../../services/editor-service/editor.service';
import { EditorTypeCategoryOption, EditorTypeOption, IEditorFormlyField, IForm } from '../../services/editor-service/editor.types';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
})
export class FieldTreeItemComponent implements OnInit, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public isExpanded = false;
	@Input() public treeLevel = 0;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

	public isActiveField: boolean;
    public childFields: IEditorFormlyField[];
	public replaceCategories: EditorTypeCategoryOption[];

    private _form: IForm;
    private _destroy$: Subject<void> = new Subject();

    constructor(public editorService: EditorService, private _renderer: Renderer2, private _elementRef: ElementRef) {
    }

	public get hasOptions(): boolean {
		return this.field.canHaveChildren || this.treeLevel !== 0;
	};

	ngOnInit(): void {
		this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');

        this.replaceCategories = this.editorService.fieldCategories.map(category => {
            // Filter fields that can have children and aren't this field
            const options: EditorTypeOption[] = category.typeOptions.filter(option => {
                if (!option.canHaveChildren) {
                    return false;
                }

                // If they're the same type, return based on customType
                if (option.name === this.field.type) {
                    return option.customName !== this.field.customType;
                }
                return true;
            });

            return { ...category, typeOptions: options };
        }).filter(category => category.typeOptions.length > 0); // Remove categories with empty fields

		if (this.field.canHaveChildren) {
			this.childFields = this.editorService.getChildren(this.field);
		}

        this._form = this.editorService.getForm(this.field.formId);
        this._form.activeField$
            .pipe(takeUntil(this._destroy$))
            .subscribe((f: IEditorFormlyField) => {
                this.isActiveField = f.formId === this.field.formId && f.fieldId === this.field.fieldId;
                if (this.isActiveField) {
                    this.expandParent.emit();
                }
            });
	}

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddChildField(type: string, customType?: string): void {
		if (this.field.canHaveChildren) {
			this.isExpanded = true;
		}

        this.editorService.addField(type, this.field.formId, customType, this.field.fieldId);
    }

    onRemoveChildField(childField: IEditorFormlyField): void {
        this.editorService.removeField(this.field.formId, childField.fieldId, this.field.fieldId);
    }

	onReplaceParentField(type: string, customType?: string): void {
		this.editorService.replaceParentField(type, this.field.formId, this.field.fieldId, customType);
	}

    onSelected(): void {
        this.editorService.selectField(this.field.formId, this.field.fieldId);
    }

    onExpandParent(): void {
        this.isExpanded = true;
        this.expandParent.emit();
    }

    trackFieldById: TrackByFunction<IEditorFormlyField> = (_, field: IEditorFormlyField) => field.fieldId;
}
