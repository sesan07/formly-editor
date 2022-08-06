import { IBaseProperty, IProperty } from '../property.types';

export interface IArrayProperty extends IBaseProperty {
    childProperty: IProperty;
    canAdd?: boolean;
}
