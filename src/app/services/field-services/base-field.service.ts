
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { Injectable } from '@angular/core';
import { IBaseFormlyField, IChipListProperty, IInputProperty, IObjectProperty, IProperty, PropertyType, StyleService } from 'editor';

import { CustomFieldType, WrapperType } from './field.types';

@Injectable()
export abstract class BaseFieldService<T extends FormlyTemplateOptions> {

	public constructor(private _styleService: StyleService) { }

	public getProperties(): IProperty[] {
        return [
			...this._getSharedProperties(),
            this._getTOProperty(this._getTOChildProperties(), this._getWrapperTypes()),
            {
                key: 'wrappers',
                type: PropertyType.CHIP_LIST,
                options: this._getWrapperTypes(),
            }
		];
    }

	private _getSharedProperties(): IProperty[] {
		return [
			{
				name: 'Key',
				key: 'key',
				type: PropertyType.TEXT,
                isSimple: true,
			},
			{
				name: 'Default Value',
				key: 'defaultValue',
				type: PropertyType.TEXT,
                outputRawValue: true,
			} as IInputProperty,
			{
				key: 'className',
				type: PropertyType.CHIP_LIST,
				options: this._styleService.allClassNames$,
				outputString: true,
			} as IChipListProperty,
			{
				key: 'fieldGroupClassName',
				type: PropertyType.CHIP_LIST,
				options: this._styleService.allClassNames$,
				outputString: true,
			} as IChipListProperty,
			{
				key: 'expressionProperties',
				type: PropertyType.OBJECT,
				addOptions: [PropertyType.TEXT],
				childProperties: [],
				populateChildrenFromTarget: true,
			} as IObjectProperty,
		];
	}

    private _getTOProperty(childProperties: IProperty[], wrappers: WrapperType[]): IObjectProperty {
        wrappers.forEach(wrapper => childProperties.push(...this._getWrapperTOProperties(wrapper)));

        // Remove duplicates with same key
        const propertyMap: Map<string, IProperty> = new Map();
        childProperties.forEach(property => propertyMap.set(property.key + '', property));

        return {
            key: 'templateOptions',
            type: PropertyType.OBJECT,
            childProperties: Array.from(propertyMap.values()),
            isSimple: true,
        };
    }

    // Wrapper template option properties
	private _getWrapperTOProperties(wrapper: WrapperType): IProperty[] {
        switch (wrapper) {
            case WrapperType.CARD:
                return [
					{
                        name: 'Card Title (for cards)',
						key: 'cardTitle',
						type: PropertyType.TEXT,
                        isSimple: true,
					},
                ];
            case WrapperType.FORM_FIELD:
                return [];
            default: throw new Error(`Unkown wrapper type: '${wrapper}'`);
        }
	}

	public abstract getDefaultConfig(customType?: CustomFieldType): IBaseFormlyField<T>;
	protected abstract _getTOChildProperties(): IProperty[];
	protected abstract _getWrapperTypes(): WrapperType[];
}
