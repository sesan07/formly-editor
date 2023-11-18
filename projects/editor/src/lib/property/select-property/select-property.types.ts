import { IBaseProperty, PropertyCreator, PropertyType } from '../property.types';

export interface ISelectProperty extends IBaseProperty {
    options: ISelectPropertyOption[];
}

export interface ISelectPropertyOption {
    label: string;
    value: string | number;
}

export const createSelectProperty: PropertyCreator<ISelectProperty> = v => ({
    ...v,
    type: PropertyType.SELECT,
});
