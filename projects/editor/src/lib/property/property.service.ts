import { Injectable } from '@angular/core';
import { isMoment } from 'moment';
import { IChipListProperty } from './chip-list-property/chip-list-property.types';
import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { IArrayProperty } from './object-array-properties/array-property.types';
import { IObjectProperty } from './object-array-properties/object-property.types';
import { PropertyType, IProperty, IBaseProperty } from './property.types';
import { ITextareaProperty } from './textarea-property/textarea-property.types';

@Injectable({
    providedIn: 'root',
})
export class PropertyService {
    public readonly possibleArrayAddTypes: PropertyType[] = [
        PropertyType.BOOLEAN,
        PropertyType.OBJECT,
        PropertyType.NUMBER,
        PropertyType.TEXT,
        PropertyType.TEXTAREA,
    ];

    public getAsArrayProperty(property: IProperty): IArrayProperty {
        return property as IArrayProperty;
    }

    public getAsChiplistProperty(property: IProperty): IChipListProperty {
        return property as IChipListProperty;
    }

    public getAsInputProperty(property: IProperty): IInputProperty {
        return property as IInputProperty;
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

    public getDefaultProperty(type: PropertyType, key: string | number = '', arrayChildType?: PropertyType): IProperty {
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
                return baseProperty;
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
                    addOptions: [
                        PropertyType.ARRAY,
                        PropertyType.BOOLEAN,
                        PropertyType.NUMBER,
                        PropertyType.OBJECT,
                        PropertyType.TEXT,
                    ],
                    childProperties: [],
                    populateChildrenFromTarget: true,
                } as IObjectProperty;
            case PropertyType.ARRAY:
                if (!arrayChildType) {
                    throw new SyntaxError('arrayChildType parameter is required when adding an array type');
                }

                return {
                    ...baseProperty,
                    canAdd: true,
                    childProperty: this.getDefaultProperty(arrayChildType),
                } as IArrayProperty;
        }
    }

    public getDefaultPropertyFromValue(value: any, key?: string): IProperty | undefined {
        const propertyType: PropertyType | undefined = this.getPropertyType(value);
        if (!propertyType) {
            return undefined;
        }

        switch (propertyType) {
            case PropertyType.ARRAY:
                if ((value as []).length) {
                    const childPropertyType: PropertyType | undefined = this.getPropertyType(value[0]);
                    if (!childPropertyType) {
                        return undefined;
                    }

                    return this.getDefaultProperty(PropertyType.ARRAY, key, childPropertyType) as IArrayProperty;
                } else {
                    return undefined;
                }
            case PropertyType.OBJECT:
                const property: IObjectProperty = this.getDefaultProperty(PropertyType.OBJECT, key) as IObjectProperty;

                return property;
            default:
                return this.getDefaultProperty(propertyType, key);
        }
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
                throw new Error(`Object property does not support adding ${type}`);
        }
    }

    public getPropertyType(value: any): PropertyType | undefined {
        switch (typeof value) {
            case 'object':
                if (value === null) {
                    return undefined;
                } else if (Array.isArray(value)) {
                    return PropertyType.ARRAY;
                } else if (isMoment(value)) {
                    return PropertyType.TEXT;
                }

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
