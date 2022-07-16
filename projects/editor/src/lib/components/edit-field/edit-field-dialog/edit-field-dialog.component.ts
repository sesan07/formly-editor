import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cloneDeep, get } from 'lodash-es';

import { IEditorFormlyField } from '../../../services/editor-service/editor.types';
import { cleanField, getFieldChildren } from '../../../utils';
import { FormService } from '../../form/form.service';
import { IObjectProperty } from '../../property/object-array-properties/object-property.types';
import { PropertyService } from '../../property/property.service';
import { PropertyType } from '../../property/property.types';
import { EditFieldRequest } from './edit-field-dialog.types';

@Component({
    selector: 'editor-edit-field-dialog',
    templateUrl: './edit-field-dialog.component.html',
    styleUrls: ['./edit-field-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditFieldDialogComponent implements OnInit {

    public formGroup: FormGroup = new FormGroup({});
    public model: Record<string, unknown> = {};
    public editField: IEditorFormlyField;
    public previewField: IEditorFormlyField;
	public property: IObjectProperty;
    public showParent: boolean;
    public showChildren = true;

    private _targetField: IEditorFormlyField;
    private _targetIndex: number;
    private _cleanChildren: IEditorFormlyField[];
    private _cleanParent: IEditorFormlyField;
    private _siblingsPath: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: EditFieldRequest,
        public propertyService: PropertyService,
        private _dialogRef: MatDialogRef<EditFieldDialogComponent, IEditorFormlyField>,
        private _formService: FormService,
    ) { }

    ngOnInit(): void {
        this._targetField = this._formService.getField(this.data.fieldId);
        this.editField = cloneDeep(this._targetField);

        if (this._targetField.parentFieldId) {
            const parent: IEditorFormlyField = this._formService.getField(this._targetField.parentFieldId);
            const siblings: IEditorFormlyField[] = getFieldChildren(parent);
            this._targetIndex = siblings.findIndex(f => f.fieldId === this._targetField.fieldId);

            this._cleanParent = cloneDeep(parent);
            cleanField(this._cleanParent, true, true);
            this._siblingsPath = parent.childrenPath;
        }

        if (this._targetField.canHaveChildren) {
            // Remove children from editField
            getFieldChildren(this.editField).length = 0;

            // Store copy of cleaned children to be reused
            this._cleanChildren = cloneDeep(getFieldChildren(this._targetField));
            this._cleanChildren.forEach(child => cleanField(child, true, true));
        }

        this._updatePreviewField();
        this._updateProperty();
    }

    onSave(): void {
        // Add children from target
        if (this.editField.canHaveChildren) {
            const children = getFieldChildren(this.editField);
            children.length = 0;
            children.push(...getFieldChildren(this._targetField));
        }

        this._dialogRef.close(this.editField);
    }

    onFieldChanged(): void {
        this._updatePreviewField();
    }

    onPreviewChanged(): void {
        this._updatePreviewField();
    }

	private _updateProperty(): void {
		this.property = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this.property.name = 'root';
		this.property.key = undefined;
		this.property.isRemovable = false;
		this.property.isKeyEditable = false;
		this.property.childProperties = this.editField.properties;
		this.property.populateChildrenFromTarget = false;
		this.property.addOptions = [];
	}

    private _updatePreviewField(): void {
		this.formGroup = new FormGroup({});
        this.model = {};
        const previewTarget: IEditorFormlyField = cloneDeep(this.editField);

        if (this.showParent && this._targetField.parentFieldId) {
            this.previewField = cloneDeep(this._cleanParent);
        } else {
            this.previewField = previewTarget;
        }

        if (this.showParent && this._targetField.parentFieldId) {
            const cleanSiblings: IEditorFormlyField[] = get(this.previewField, this._siblingsPath);
            cleanSiblings[this._targetIndex] = previewTarget;
        }

        if (this.showChildren && this._targetField.canHaveChildren) {
            getFieldChildren(previewTarget).push(...cloneDeep(this._cleanChildren));
        }

        const previewTargetClone: IEditorFormlyField = cloneDeep(previewTarget);
        cleanField(previewTargetClone, false, true);

        console.log('PREVIEW FIELD', JSON.stringify(previewTargetClone, null, 2));

        previewTarget.templateOptions.hideEditorWrapperOptions = true;
    }

}