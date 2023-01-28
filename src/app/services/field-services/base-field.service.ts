import { FormlyTemplateOptions } from '@ngx-formly/core';
import { Injectable } from '@angular/core';
import {
    IBaseFormlyField,
    IChipListProperty,
    IInputProperty,
    IObjectProperty,
    IProperty,
    PropertyType,
    StylesService,
} from 'editor';

import { CustomFieldType, WrapperType } from './field.types';

@Injectable()
export abstract class BaseFieldService<T extends FormlyTemplateOptions> {
    public constructor(private _stylesService: StylesService) {}

    public getProperties(): IProperty[] {
        return [
            {
                name: 'Key',
                key: 'key',
                type: PropertyType.TEXT,
                isSimple: true,
            },
            ...this._getTOProperty(this._getTOChildProperties(), this._getWrapperTypes()),
            ...this._getSharedProperties(),
            {
                name: 'Wrappers',
                key: 'wrappers',
                type: PropertyType.CHIP_LIST,
                options: this._getWrapperTypes(),
                isSimple: true,
            },
        ];
    }

    private _getSharedProperties(): IProperty[] {
        return [
            {
                name: 'Default Value',
                key: 'defaultValue',
                type: PropertyType.TEXT,
                outputRawValue: true,
                isSimple: true,
            } as IInputProperty,
            {
                name: 'Hide',
                key: 'hide',
                type: PropertyType.BOOLEAN,
                isSimple: true,
            },
            {
                name: 'Classes',
                key: 'className',
                type: PropertyType.CHIP_LIST,
                options: this._stylesService.allClassNames$,
                outputString: true,
                isSimple: true,
            } as IChipListProperty,
            {
                name: 'Field Group Classes',
                key: 'fieldGroupClassName',
                type: PropertyType.CHIP_LIST,
                options: this._stylesService.allClassNames$,
                outputString: true,
                isSimple: true,
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

    private _getTOProperty(childProperties: IProperty[], wrappers: WrapperType[]): IProperty[] {
        wrappers.forEach(wrapper => childProperties.push(...this._getWrapperTOProperties(wrapper)));

        // Remove duplicates with same key
        const propertyMap: Map<string, IProperty> = new Map();
        childProperties.forEach(property => propertyMap.set(property.key + '', property));

        return Array.from(propertyMap.values());
        // return {
        //     key: 'templateOptions',
        //     type: PropertyType.OBJECT,
        //     childProperties: Array.from(propertyMap.values()),
        //     isSimple: true,
        // };
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
            default:
                throw new Error(`Unkown wrapper type: '${wrapper}'`);
        }
    }

    public abstract getDefaultConfig(customType?: CustomFieldType): IBaseFormlyField<T>;
    protected abstract _getTOChildProperties(): IProperty[];
    protected abstract _getWrapperTypes(): WrapperType[];
}
