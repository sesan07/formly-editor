import { Injectable } from '@angular/core';

import { IChipListProperty } from './chip-list-property/chip-list-property.types';
import { IArrayProperty } from './cyclic-properties/array-property.types';
import { IObjectProperty } from './cyclic-properties/object-property.types';
import { IValidatorsProperty } from './cyclic-properties/validators-property.types';
import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { IBaseProperty, IProperty, PropertyType } from './property.types';
import { ISelectProperty } from './select-property/select-property.types';
import { ITextareaProperty } from './textarea-property/textarea-property.types';

@Injectable({
    providedIn: 'root',
})
export class PropertyService {
    public getAsArrayProperty(property: IProperty): IArrayProperty {
        return property as IArrayProperty;
    }

    public getAsChiplistProperty(property: IProperty): IChipListProperty {
        return property as IChipListProperty;
    }

    public getAsInputProperty(property: IProperty): IInputProperty {
        return property as IInputProperty;
    }

    public getAsSelectProperty(property: IProperty): ISelectProperty {
        return property as ISelectProperty;
    }

    public getAsTextareaProperty(property: IProperty): ITextareaProperty {
        return property as ITextareaProperty;
    }

    public getAsObjectProperty(property: IProperty): IObjectProperty {
        return property as IObjectProperty;
    }

    public getAsExpressionPropertiesProperty(property: IProperty): IExpressionPropertiesProperty {
        return property as IExpressionPropertiesProperty;
    }

    public getAsValidatorsProperty(property: IProperty): IValidatorsProperty {
        return property as IValidatorsProperty;
    }

    public getDefaultProperty(type: PropertyType, key: string | number = ''): IProperty {
        // Properties added by the user should have editable keys and be deletable
        const baseProperty: IBaseProperty = {
            type,
            key,
            isKeyEditable: true,
            isRemovable: true,
        };

        switch (type) {
            case PropertyType.BOOLEAN:
            case PropertyType.TEXT:
                return {
                    ...baseProperty,
                    outputRawValue: true,
                };
            case PropertyType.TEXTAREA:
                return {
                    ...baseProperty,
                    minRows: 2,
                } as ITextareaProperty;
            case PropertyType.NUMBER:
                return {
                    ...baseProperty,
                    outputRawValue: true,
                } as IInputProperty;
            case PropertyType.OBJECT:
                return {
                    ...baseProperty,
                    canAdd: true,
                    childProperties: [],
                    populateChildrenFromTarget: true,
                } as IObjectProperty;
            case PropertyType.ARRAY:
                return {
                    ...baseProperty,
                    canAdd: true,
                } as IArrayProperty;
        }
    }

    public getDefaultPropertyFromValue(value: any, key?: string): IProperty | undefined {
        const propertyType: PropertyType | undefined = this.getPropertyType(value);
        if (!propertyType) {
            return undefined;
        }
        return this.getDefaultProperty(propertyType, key);
    }

    public getDefaultPropertyValue(type: PropertyType): any {
        switch (type) {
            case PropertyType.ARRAY:
                return [];
            case PropertyType.BOOLEAN:
                return false;
            case PropertyType.OBJECT:
                return {};
            case PropertyType.NUMBER:
                return 0;
            case PropertyType.TEXT:
            case PropertyType.TEXTAREA:
                return '';
            default:
                throw new Error(`Property type ${type} does not have a default value`);
        }
    }

    public getPropertyType(value: any): PropertyType | undefined {
        switch (typeof value) {
            case 'object':
                if (value === null) {
                    return undefined;
                } else if (Array.isArray(value)) {
                    return PropertyType.ARRAY;
                }
                // } else if (isMoment(value)) {
                //     return PropertyType.TEXT;
                // }

                return PropertyType.OBJECT;
            case 'boolean':
                return PropertyType.BOOLEAN;
            case 'number':
                return PropertyType.NUMBER;
            case 'string':
                return PropertyType.TEXT;
            default:
                return undefined;
        }
    }
}
