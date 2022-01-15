import { IBaseProperty } from '../property.types';

export interface IChipListProperty extends IBaseProperty {
    options: string[];
    notRemovableOptions?: string[];
    outputString?: boolean;
}
