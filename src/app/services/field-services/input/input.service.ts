import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FieldType, IBaseEditorFormlyField, WrapperType } from '../../form-service/form.types';
import { IProperty, PropertyType } from 'src/app/components/property/property.types';
import { IInputTemplateOptions } from './input.types';
import { IObjectProperty } from 'src/app/components/property/object-property/object-property.types';

@Injectable({
	providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {

	public name = 'Input';
	public type: FieldType = FieldType.INPUT;

	public getDefaultConfig(formId: string, parentFieldId?: string): IBaseEditorFormlyField<IInputTemplateOptions> {
		return {
			formId,
			parentFieldId,
			name: this.name,
			type: this.type,
			fieldId: this.getNextFieldId(),
			wrappers: [WrapperType.EDITOR, WrapperType.FORM_FIELD],
			templateOptions: {
				label: 'Label',
				placeholder: 'Placeholder',
				description: 'Description',
				required: true
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
						key: 'placeholder',
						type: PropertyType.TEXT,
					},
					{
						key: 'description',
						type: PropertyType.TEXT,
					},
					{
						key: 'required',
						type: PropertyType.BOOLEAN,
					},
				]
			} as IObjectProperty,
			...this._getWrapperProperties([WrapperType.FORM_FIELD]),
		];
	}
}
