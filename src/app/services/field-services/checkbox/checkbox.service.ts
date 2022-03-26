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

    protected _getTOChildProperties(): IProperty[] {
        return [
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
        ];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.FORM_FIELD];
    }
}
