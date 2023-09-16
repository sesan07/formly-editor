import { IBaseProperty, IProperty, PropertyType } from '../property.types';

export interface IObjectProperty extends IBaseProperty {
    canAdd?: boolean;
    childProperties: IProperty[];
    populateChildrenFromTarget?: boolean;
}
