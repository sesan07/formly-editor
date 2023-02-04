import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IArrayProperty } from './object-array-properties/array-property.types';
import { IObjectProperty } from './object-array-properties/object-property.types';
import { IBaseProperty, IProperty, PropertyType } from './property.types';

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
        objectProperty.addOptions = [];
    }
};

export const isParentProperty = (
    property: IBaseProperty
): property is IObjectProperty | IArrayProperty | IExpressionPropertiesProperty =>
    property.type === PropertyType.OBJECT ||
    property.type === PropertyType.ARRAY ||
    property.type === PropertyType.EXPRESSION_PROPERTIES;
