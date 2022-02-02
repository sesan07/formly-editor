import { Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, Renderer2 } from '@angular/core';
import { EditorTypeCategoryOption, EditorTypeOption } from '../../editor.types';
import { FormService } from '../../services/form-service/form.service';
import { FieldType, IBaseEditorFormlyField } from '../../services/form-service/form.types';

@Component({
    selector: 'app-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
})
export class FieldTreeItemComponent implements OnInit, OnChanges {
    @Input() public field: IBaseEditorFormlyField;
    @Input() public activeField: IBaseEditorFormlyField;
    @Input() public isExpanded = false;
	@Input() public treeLevel = 0;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
	@HostBinding('class.highlighted') get propertyHighlighted() { return this.isPropertyHighlighted; }

	public isPropertyHighlighted: boolean;
    public childFields: IBaseEditorFormlyField[];
	public treeLevelPadding: number;
	public replaceCategories: EditorTypeCategoryOption[];

    constructor(public formService: FormService, private _renderer: Renderer2, private _elementRef: ElementRef) {
    }

	ngOnInit(): void {
		this.treeLevelPadding = 24 * this.treeLevel;
		this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');
		this._renderer.addClass(this._elementRef.nativeElement, 'cursor-pointer');
	}

    ngOnChanges(): void {
        this.replaceCategories = this.formService.fieldCategories.map(category => {
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
			this.childFields = this.formService.getChildren(this.field);
		}
    }

    onAddChildField(type: string, customType?: string): void {
		if (this.field.canHaveChildren) {
			this.isExpanded = true;
		}

        this.formService.addField(type, this.field.formId, customType, this.field.fieldId);
    }

    onRemoveChildField(childField: IBaseEditorFormlyField): void {
        this.formService.removeField(this.field.formId, childField.fieldId, this.field.fieldId);
    }

	onReplaceParentField(type: string, customType?: string): void {
		this.formService.replaceParentField(type, this.field.formId, this.field.fieldId, customType);
	}

	onHeaderClicked(event: MouseEvent): void {
		if (this.field.canHaveChildren) {
			this.isExpanded = true;
		}

        this.formService.selectField(this.field.formId, this.field.fieldId);
		event.stopPropagation();
	}

	onToggle(event: MouseEvent): void {
		this.isExpanded = !this.isExpanded;

		if (!this.isExpanded) {
			this.formService.selectField(this.field.formId, this.field.fieldId);
		}

		event.stopPropagation();
	}
}
