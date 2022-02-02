import { Injectable } from '@angular/core';
import { IProperty, PropertyType } from 'editor';
import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { ITextareaTemplateOptions } from './textarea.types';

@Injectable({
	providedIn: 'root',
})
export class TextareaService extends BaseFieldService<ITextareaTemplateOptions> {

	public type: FieldType = FieldType.TEXTAREA;
	protected defaultName = 'Textarea';

	public getDefaultConfig(
        formId: string,
        customType?: CustomFieldType,
        parentFieldId?: string
    ): IEditorFormlyField<ITextareaTemplateOptions> {
		return {
			formId,
			parentFieldId,
			name: this.defaultName,
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
                ],
                [WrapperType.FORM_FIELD]
            ),
			this._getWrapperProperty([WrapperType.FORM_FIELD])
		];
	}
}
