import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { IInputTemplateOptions } from './input.types';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { IProperty, PropertyType } from 'editor';

@Injectable({
	providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {

	public getDefaultConfig(customType?: CustomFieldType): IFormlyField<IInputTemplateOptions> {
        const config: IFormlyField<IInputTemplateOptions> = {
			type: FieldType.INPUT,
			wrappers: [WrapperType.FORM_FIELD],
			templateOptions: {
				label: 'Label',
				placeholder: 'Placeholder',
				description: 'Description',
				required: true
			},
			expressionProperties: {},
		};

        switch (customType) {
            case CustomFieldType.NUMBER:
                config.name = 'Number';
                config.customType = customType;
                config.templateOptions.type = 'number';
        }

        return config;
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
						key: 'type',
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
                ],
                [WrapperType.FORM_FIELD]
            ),
			this._getWrapperProperty([WrapperType.FORM_FIELD])
		];
	}
}
