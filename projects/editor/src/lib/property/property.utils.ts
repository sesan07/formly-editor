import { produce } from 'immer';
import { get, set, unset } from 'lodash-es';
import { IArrayProperty } from './cyclic-properties/array-property.types';
import { IObjectProperty } from './cyclic-properties/object-property.types';
import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { IBaseProperty, IProperty, IPropertyChange, PropertyChangeType, PropertyType } from './property.types';
import { ITextareaProperty } from './textarea-property/textarea-property.types';

export const initRootProperty = (
    property: IObjectProperty | IArrayProperty,
    isObject?: boolean,
    childProperties?: IProperty[]
) => {
    property.name = 'root';
    property.key = undefined;
    property.isRemovable = false;
    property.isKeyEditable = false;

    if (isObject) {
        const objectProperty: IObjectProperty = property as IObjectProperty;
        objectProperty.childProperties = childProperties;
        objectProperty.populateChildrenFromTarget = false;
        objectProperty.canAdd = false;
    }
};

export const isParentProperty = (
    property: IBaseProperty
): property is IObjectProperty | IArrayProperty | IExpressionPropertiesProperty =>
    property.type === PropertyType.OBJECT ||
    property.type === PropertyType.ARRAY ||
    property.type === PropertyType.EXPRESSION_PROPERTIES;

const modifyTargetKey = <T extends Record<string, any>>(
    target: T,
    { path, newPath }: Omit<IPropertyChange, 'type'>
): T =>
    produce(target, draft => {
        if (newPath) {
            set(draft, newPath, get(draft, path));

            // Clear previous key if new path isn't empty
            if (newPath.slice(-1)[0]) {
                unset(draft, path);
            }
        } else {
            unset(draft, path);
        }
    });

const modifyTargetValue = <T extends Record<string, any>>(
    target: T,
    { path, value }: Omit<IPropertyChange, 'type'>
): T =>
    produce(target, draft => {
        set(draft, path, value);
    });

export const modifyPropertyTarget = <T extends Record<string, any>>(
    target: T,
    { type, ...change }: IPropertyChange
): T => {
    switch (type) {
        case PropertyChangeType.KEY:
            return modifyTargetKey(target, change);
        case PropertyChangeType.VALUE:
            return modifyTargetValue(target, change);
    }
};

export const getDefaultProperty = (type: PropertyType, key: string | number = ''): IProperty => {
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
};

export const getDefaultPropertyFromValue = (value: any, key?: string): IProperty | undefined => {
    const propertyType: PropertyType | undefined = getPropertyType(value);
    if (!propertyType) {
        return undefined;
    }
    return getDefaultProperty(propertyType, key);
};

export const getDefaultPropertyValue = (type: PropertyType): any => {
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
};

const getPropertyType = (value: any): PropertyType | undefined => {
    switch (typeof value) {
        case 'object':
            if (value === null) {
                return undefined;
            } else if (Array.isArray(value)) {
                return PropertyType.ARRAY;
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
};
