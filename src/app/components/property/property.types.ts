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
}

export interface IBaseProperty {
	type: PropertyType;
	key?: string | number;
	isDeletable?: boolean;
	isKeyEditable?: boolean;
}

export type IProperty = IArrayProperty | IBooleanProperty | IChipListProperty | IObjectProperty | IInputProperty;
