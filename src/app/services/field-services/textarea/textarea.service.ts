import { Injectable } from '@angular/core';
import { IProperty, PropertyType } from 'editor';
import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { ITextareaTemplateOptions } from './textarea.types';

@Injectable({
	providedIn: 'root',
})
export class TextareaService extends BaseFieldService<ITextareaTemplateOptions> {

	public getDefaultConfig(customType?: CustomFieldType): IFormlyField<ITextareaTemplateOptions> {
		return {
			type: FieldType.TEXTAREA,
			wrappers: [WrapperType.FORM_FIELD],
			templateOptions: {
				label: 'Label',
				placeholder: 'Placeholder',
				description: 'Description',
				required: true
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
                        name: 'Placeholder',
						key: 'placeholder',
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
                        name: 'Required',
						key: 'required',
						type: PropertyType.BOOLEAN,
                        isSimple: true,
					},
                ],
                [WrapperType.FORM_FIELD]
            ),
			this._getWrapperProperty([WrapperType.FORM_FIELD])
		];
	}
}
