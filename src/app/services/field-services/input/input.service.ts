import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { IInputTemplateOptions } from './input.types';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { IProperty, PropertyType } from 'editor';

@Injectable({
	providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {

	public type: FieldType = FieldType.INPUT;
	protected defaultName = 'Input';

	public getDefaultConfig(
            formId: string,
            customType?: CustomFieldType,
            parentFieldId?: string
        ): IEditorFormlyField<IInputTemplateOptions> {

        const config: IEditorFormlyField<IInputTemplateOptions> = {
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

    // protected _getTemplateOptionsProperty(wrappers: WrapperType[]): IObjectProperty {
    //     const childProperties: IProperty[] = [];
    //     wrappers.forEach(wrapper => childProperties.push(...this._getWrapperProperties(wrapper)));

    //     // Remove duplicates
    //     const propertyMap: Map<string, IProperty> = new Map();
    //     childProperties.forEach(property => propertyMap.set(property.key + '', property));

    //     return {
    //         key: 'templateOptions',
    //         type: PropertyType.OBJECT,
    //         childProperties: Array.from(propertyMap.values())
    //     };
    // }
}
