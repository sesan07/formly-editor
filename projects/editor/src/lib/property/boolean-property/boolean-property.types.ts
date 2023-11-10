import { IBaseProperty, PropertyCreator, PropertyType } from '../property.types';

export type IBooleanProperty = IBaseProperty;

export const createBooleanProperty: PropertyCreator<IBooleanProperty> = v => ({
    ...v,
    type: PropertyType.BOOLEAN,
});
