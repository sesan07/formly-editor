import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { IInputTemplateOptions } from './input.types';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { IProperty, PropertyType } from 'src/app/editor/components/property/property.types';
import { IObjectProperty } from 'src/app/editor/components/property/object-property/object-property.types';

@Injectable({
	providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {

	public type: FieldType = FieldType.INPUT;

	public getDefaultConfig(
            formId: string,
            customType?: CustomFieldType,
            parentFieldId?: string
        ): IEditorFormlyField<IInputTemplateOptions> {

        const config: IEditorFormlyField<IInputTemplateOptions> = {
			formId,
			parentFieldId,
			name: 'Input',
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
			{
				key: 'templateOptions',
				type: PropertyType.OBJECT,
				childProperties: [
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
				]
			} as IObjectProperty,
			...this._getWrapperProperties([WrapperType.FORM_FIELD]),
		];
	}
}
