import produce from 'immer';
import { get, set, unset } from 'lodash-es';
import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IArrayProperty } from './cyclic-properties/array-property.types';
import { IObjectProperty } from './cyclic-properties/object-property.types';
import { IBaseProperty, IProperty, IPropertyChange, PropertyChangeType, PropertyType } from './property.types';

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

export const modifyKey = <T extends Record<string, any>>(
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

export const modifyValue = <T extends Record<string, any>>(
    target: T,
    { path, value }: Omit<IPropertyChange, 'type'>
): T =>
    produce(target, draft => {
        set(draft, path, value);
    });

export const changePropertyTarget = <T extends Record<string, any>>(
    target: T,
    { type, ...change }: IPropertyChange
): T => {
    switch (type) {
        case PropertyChangeType.KEY:
            return modifyKey(target, change);
        case PropertyChangeType.VALUE:
            return modifyValue(target, change);
    }
};
