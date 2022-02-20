import { Injectable } from '@angular/core';
import { IArrayProperty, IObjectProperty, IProperty, PropertyType } from 'editor';
import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { IRadioTemplateOptions } from './radio.types';

@Injectable({
	providedIn: 'root',
})
export class RadioService extends BaseFieldService<IRadioTemplateOptions> {

	public getDefaultConfig(customType?: CustomFieldType): IFormlyField<IRadioTemplateOptions> {
		return {
			type: FieldType.RADIO,
			wrappers: [WrapperType.FORM_FIELD],
			templateOptions: {
				label: 'Label',
				placeholder: 'Placeholder',
				description: 'Description',
				required: true,
				options: [
					{ value: 1, label: 'Option 1' },
					{ value: 2, label: 'Option 2' },
					{ value: 3, label: 'Option 3' },
					{ value: 4, label: 'Option 4', disabled: true },
				],
			},
			expressionProperties: {},
		};
	}

	getProperties(): IProperty[] {
		return [
			...this._getSharedProperties(),
            this._getTemplateOptionsProperty(
                [
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
					{
						key: 'options',
						type: PropertyType.ARRAY,
						canAdd: true,
						childProperty: {
							type: PropertyType.OBJECT,
							isDeletable: true,
							childProperties: [
								{
									key: 'label',
									type: PropertyType.TEXT,
								},
								{
									key: 'value',
									type: PropertyType.TEXT,
								},
								{
									key: 'disabled',
									type: PropertyType.BOOLEAN,
								},
							],
						} as IObjectProperty
					} as IArrayProperty,
                ],
                [WrapperType.FORM_FIELD]
            ),
			this._getWrapperProperty([WrapperType.FORM_FIELD])
		];
	}
}
