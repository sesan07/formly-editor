import { Injectable } from '@angular/core';
import { IProperty, PropertyType, IObjectProperty } from 'editor';
import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { ICheckboxTemplateOptions } from './checkbox.types';

@Injectable({
	providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxTemplateOptions> {

	public getDefaultConfig(customType?: CustomFieldType): IFormlyField<ICheckboxTemplateOptions> {
		return {
			type: FieldType.CHECKBOX,
			wrappers: [WrapperType.FORM_FIELD],
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
		};
	}

	getProperties(): IProperty[] {
		return [
			...this._getSharedProperties(),
            this._getTemplateOptionsProperty(
                [
                    {
                        name: 'Label',
                        key: 'label',
                        type: PropertyType.TEXT,
                        isSimple: true,
                    },
                    {
                        name: 'Description',
                        key: 'description',
                        type: PropertyType.TEXT,
                        isSimple: true,
                    },
                    {
                        key: 'pattern',
                        type: PropertyType.TEXT,
                    },
                    {
                        name: 'Required',
                        key: 'required',
                        type: PropertyType.BOOLEAN,
                        isSimple: true,
                    },
                ],
                [WrapperType.FORM_FIELD]
            ),
			{
				key: 'validation',
				type: PropertyType.OBJECT,
				addOptions: [PropertyType.OBJECT, PropertyType.BOOLEAN],
				childProperties: [],
				populateChildrenFromTarget: true,
			} as IObjectProperty,
			this._getWrapperProperty([WrapperType.FORM_FIELD])
		];
	}
}
