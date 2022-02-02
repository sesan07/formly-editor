import { Injectable } from '@angular/core';
import { IObjectProperty } from 'src/app/editor/components/property/object-property/object-property.types';
import { IProperty, PropertyType } from 'src/app/editor/components/property/property.types';
import { BaseFieldService } from '../base-field.service';
import { FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { ICheckboxTemplateOptions } from './checkbox.types';

@Injectable({
	providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxTemplateOptions> {

	public name = 'Checkbox';
	public type: FieldType = FieldType.CHECKBOX;

	public getDefaultConfig(formId: string, parentFieldId?: string): IEditorFormlyField<ICheckboxTemplateOptions> {
		return {
			formId,
			parentFieldId,
			name: this.name,
			type: this.type,
			fieldId: this.getNextFieldId(),
			wrappers: [WrapperType.EDITOR, WrapperType.FORM_FIELD],
			templateOptions: {
				label: 'Accept terms',
				description: 'In order to proceed, please accept terms',
				pattern: 'true',
				required: true
			},
			validation: {
				messages: {
					pattern: 'Please accept the terms',
				},
			},
			expressionProperties: {},
			fieldProperties: this.getProperties(),
		};
	}

	getProperties(): IProperty[] {
		return [
			...this._getSharedProperties(),
			{
				key: 'templateOptions',
				type: PropertyType.OBJECT,
				childProperties: [
					{
						key: 'label',
						type: PropertyType.TEXT,
					},
					{
						key: 'description',
						type: PropertyType.TEXT,
					},
					{
						key: 'pattern',
						type: PropertyType.TEXT,
					},
					{
						key: 'required',
						type: PropertyType.BOOLEAN,
					},
				]
			} as IObjectProperty,
			{
				key: 'validation',
				type: PropertyType.OBJECT,
				addOptions: [PropertyType.OBJECT],
				childProperties: [],
				populateChildrenFromTarget: true,
			} as IObjectProperty,
			...this._getWrapperProperties([WrapperType.FORM_FIELD]),
		];
	}
}
