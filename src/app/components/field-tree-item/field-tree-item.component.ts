import { Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, Renderer2 } from '@angular/core';
import { FormService } from '../../services/form-service/form.service';
import { FieldType, IEditorFormlyField } from '../../services/form-service/form.types';

@Component({
    selector: 'app-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
})
export class FieldTreeItemComponent implements OnInit, OnChanges {
    @Input() public field: IEditorFormlyField;
    @Input() public activeField: IEditorFormlyField;
    @Input() public isExpanded = false;
	@Input() public treeLevel = 0;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
	@HostBinding('class.highlighted') get propertyHighlighted() { return this.isPropertyHighlighted; }

	public isPropertyHighlighted: boolean;
    public childFields: IEditorFormlyField[];
	public treeLevelPadding: number;
	public parentFieldTypes: FieldType[] = this.formService.getParentFieldTypes();
	public replaceOptions: FieldType[];
    public canHaveChildren: boolean;

    constructor(public formService: FormService, private _renderer: Renderer2, private _elementRef: ElementRef) {
    }

	ngOnInit(): void {
		this.treeLevelPadding = 24 * this.treeLevel;
		this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');
		this._renderer.addClass(this._elementRef.nativeElement, 'cursor-pointer');
	}

    ngOnChanges(): void {
		this.replaceOptions = this.parentFieldTypes.filter(type => type !== this.field.type);
        this.canHaveChildren = this.parentFieldTypes.includes(this.field.type);
		if (this.canHaveChildren) {
			this.childFields = this.formService.getChildren(this.field);
		}
    }

    onAddChildField(type: FieldType): void {
		if (this.canHaveChildren) {
			this.isExpanded = true;
		}

        this.formService.addField(type, this.field.formId, this.field.fieldId);
    }

    onRemoveChildField(childField: IEditorFormlyField): void {
        this.formService.removeField(this.field.formId, childField.fieldId, this.field.fieldId);
    }

	onReplaceParentField(type: FieldType): void {
		this.formService.replaceParentField(type, this.field.formId, this.field.fieldId);
	}

	onHeaderClicked(event: MouseEvent): void {
		if (this.canHaveChildren) {
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
