import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cloneDeep } from 'lodash-es';
import { EditorService } from '../../services/editor-service/editor.service';
import { IEditorFormlyField } from '../../services/editor-service/editor.types';
import { IObjectProperty } from '../property/object-property/object-property.types';
import { PropertyService } from '../property/property.service';
import { PropertyType } from '../property/property.types';
import { EditFieldRequest } from './edit-field-dialog.types';

@Component({
    selector: 'lib-edit-field-dialog',
    templateUrl: './edit-field-dialog.component.html',
    styleUrls: ['./edit-field-dialog.component.scss']
})
export class EditFieldDialogComponent implements OnInit {

    public editField: IEditorFormlyField;
    public previewField: IEditorFormlyField;
	public property: IObjectProperty;
    public showChildren: boolean;

    private _targetField: IEditorFormlyField;
    private _children: IEditorFormlyField[];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditFieldRequest,
        public propertyService: PropertyService,
        private _dialogRef: MatDialogRef<EditFieldDialogComponent, IEditorFormlyField>,
        private _editorService: EditorService,
    ) { }

    ngOnInit(): void {
        this._targetField = this._editorService.getField(this.data.formId, this.data.fieldId);
        this.editField = cloneDeep(this._targetField);

        if (this._targetField.canHaveChildren) {
            // Remove children from editField
            this._editorService.getChildren(this.editField).length = 0;

            // Store copy of cleaned children to be reused
            this._children = cloneDeep(this._editorService.getChildren(this._targetField));
            this._children.forEach(child => this._editorService.cleanField(child, true, true));
        }
        this._updatePreviewField();
        this._updateProperty();
    }

    onSave(): void {
        this._dialogRef.close(this.editField);
    }

    onShowChildrenChanged(): void {
        this._updatePreviewField();
    }

    onValueChanged(): void {
        this._updatePreviewField();
    }

	onFieldPropertyChanged(): void {
        this._updatePreviewField();
	}

	private _updateProperty(): void {
		this.property = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this.property.name = 'root';
		this.property.key = undefined;
		this.property.isDeletable = false;
		this.property.isKeyEditable = false;
		this.property.childProperties = this.editField.properties;
		this.property.populateChildrenFromTarget = false;
		this.property.addOptions = [];
	}

    private _updatePreviewField(): void {
        this.previewField = cloneDeep(this.editField);
        if (this._targetField.canHaveChildren && this.showChildren) {
            this._editorService.getChildren(this.previewField).push(...cloneDeep(this._children));
        }
        this._editorService.cleanField(this.previewField, false, true);

        console.log('PREVIEW FIELD', JSON.stringify(this.previewField, null, 4));
    }

}
