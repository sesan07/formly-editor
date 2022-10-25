import { IArrayProperty } from './object-array-properties/array-property.types';
import { IObjectProperty } from './object-array-properties/object-property.types';
import { IProperty } from './property.types';

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
