import { IObjectProperty } from '../object-property/object-property.types';
import { IBaseProperty } from '../property.types';

export type IValidatorsProperty = IBaseProperty;

export interface IValidatorsValue {
    [key: string]: IValidationData | string[];
    validation?: string[];
}

export interface IValidationData {
    name: string;
    message?: string;
    options?: Record<string, any>;
}

export interface IValidationConfig {
    data: IValidationData;
    property: IObjectProperty;
}
