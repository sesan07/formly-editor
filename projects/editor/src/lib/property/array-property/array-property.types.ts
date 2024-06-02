import { IBaseProperty, IProperty, PropertyCreator, PropertyType } from '../property.types';

export interface IArrayProperty extends IBaseProperty {
    childProperty?: IProperty;
    canAdd?: boolean;
}

export const createArrayProperty: PropertyCreator<IArrayProperty> = v => ({
    ...v,
    type: PropertyType.ARRAY,
});
