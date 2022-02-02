import { Injectable } from '@angular/core';
import { IObjectProperty } from 'src/app/editor/components/property/object-property/object-property.types';
import { IProperty, PropertyType } from 'src/app/editor/components/property/property.types';
import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { ICheckboxTemplateOptions } from './checkbox.types';

@Injectable({
	providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxTemplateOptions> {

	public type: FieldType = FieldType.CHECKBOX;
	protected defaultName = 'Checkbox';

	public getDefaultConfig(
        formId: string,
        customType?: CustomFieldType,
        parentFieldId?: string
    ): IEditorFormlyField<ICheckboxTemplateOptions> {
		return {
			formId,
			parentFieldId,
			name: this.defaultName,
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
            this._getTemplateOptionsProperty(
                [
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
                ],
                [WrapperType.FORM_FIELD]
            ),
			{
				key: 'validation',
				type: PropertyType.OBJECT,
				addOptions: [PropertyType.OBJECT],
				childProperties: [],
				populateChildrenFromTarget: true,
			} as IObjectProperty,
			this._getWrapperProperty([WrapperType.FORM_FIELD])
		];
	}
}
