import { IBaseProperty, IProperty, PropertyCreator, PropertyType } from '../property.types';

export interface IObjectProperty extends IBaseProperty {
    canAdd?: boolean;
    childProperties: IProperty[];
    populateChildrenFromTarget?: boolean;
}

export const createObjectProperty: PropertyCreator<IObjectProperty> = v => ({
    ...v,
    type: PropertyType.OBJECT,
});
