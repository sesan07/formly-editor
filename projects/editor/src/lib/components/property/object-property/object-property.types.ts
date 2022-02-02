import { IBaseProperty, IProperty, PropertyType } from '../property.types';

export interface IObjectProperty extends IBaseProperty {
	name?: string;
	addOptions?: PropertyType[];
    childProperties: IProperty[];
	populateChildrenFromTarget?: boolean;
}
