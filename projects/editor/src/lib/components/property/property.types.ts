import { IArrayProperty } from './array-property/array-property.types';
import { IBooleanProperty } from './boolean-property/boolean-property.types';
import { IChipListProperty } from './chip-list-property/chip-list-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { IObjectProperty } from './object-property/object-property.types';

export enum PropertyType {
	ARRAY = 'Array',
	BOOLEAN = 'Boolean',
	CHIP_LIST = 'Chip List',
	OBJECT = 'Object',
	NUMBER = 'Number',
	TEXT = 'Text',
	TEXTAREA = 'Textarea',
}

export interface IBaseProperty {
	type: PropertyType;
    name?: string;
	key?: string | number;
	isRemovable?: boolean;
	isKeyEditable?: boolean;
    isSimple?: boolean;
}

export type IProperty = IArrayProperty | IBooleanProperty | IChipListProperty | IObjectProperty | IInputProperty;
