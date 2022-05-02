import { IBaseProperty } from '../property.types';

export interface ITextareaProperty extends IBaseProperty {
    maxRows?: number;
    minRows?: number;
}
