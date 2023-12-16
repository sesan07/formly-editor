import { IBaseProperty, PropertyCreator, PropertyType } from '../property.types';

export interface IInputProperty extends IBaseProperty {
    outputRawValue?: boolean;
    placeholder?: string;
}

export const createTextProperty: PropertyCreator<IInputProperty> = v => ({
    ...v,
    type: PropertyType.TEXT,
});
