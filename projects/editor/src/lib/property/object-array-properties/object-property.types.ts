import { IBaseProperty, IProperty, PropertyType } from '../property.types';

export interface IObjectProperty extends IBaseProperty {
    addOptions?: PropertyType[];
    childProperties: IProperty[];
    populateChildrenFromTarget?: boolean;
}
