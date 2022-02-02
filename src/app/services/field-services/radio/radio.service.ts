import { Injectable } from '@angular/core';
import { IArrayProperty } from 'src/app/editor/components/property/array-property/array-property.types';
import { IObjectProperty } from 'src/app/editor/components/property/object-property/object-property.types';
import { IProperty, PropertyType } from 'src/app/editor/components/property/property.types';
import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { IRadioTemplateOptions } from './radio.types';

@Injectable({
	providedIn: 'root',
})
export class RadioService extends BaseFieldService<IRadioTemplateOptions> {

	public type: FieldType = FieldType.RADIO;

	public getDefaultConfig(
        formId: string,
        customType?: CustomFieldType,
        parentFieldId?: string
    ): IEditorFormlyField<IRadioTemplateOptions> {
		return {
			formId,
			parentFieldId,
			name: 'Radio',
			type: this.type,
			fieldId: this.getNextFieldId(),
			wrappers: [WrapperType.EDITOR, WrapperType.FORM_FIELD],
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
				]
			} as IObjectProperty,
			...this._getWrapperProperties([WrapperType.FORM_FIELD]),
		];
	}
}
