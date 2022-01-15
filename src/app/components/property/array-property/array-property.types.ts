import { IBaseProperty, IProperty } from '../property.types';

export interface IArrayProperty extends IBaseProperty {
	childProperty: IProperty;
	name?: string;
	canAdd?: boolean;
}
