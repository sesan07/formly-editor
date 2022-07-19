import { Observable } from 'rxjs';
import { IBaseProperty } from '../property.types';

export interface IChipListProperty extends IBaseProperty {
    options: string[] | Observable<string[]>;
    outputString?: boolean;
}
