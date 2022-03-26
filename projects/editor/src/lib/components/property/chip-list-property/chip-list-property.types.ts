import { IBaseProperty } from '../property.types';

export interface IChipListProperty extends IBaseProperty {
    options: string[];
    hiddenOptions?: string[];
    outputString?: boolean;
}
