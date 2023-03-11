import { IBooleanProperty } from './boolean-property/boolean-property.types';
import { IChipListProperty } from './chip-list-property/chip-list-property.types';
import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { IArrayProperty } from './object-array-properties/array-property.types';
import { IObjectProperty } from './object-array-properties/object-property.types';

export enum PropertyType {
    ARRAY = 'Array',
    BOOLEAN = 'Boolean',
    CHIP_LIST = 'Chip List',
    OBJECT = 'Object',
    NUMBER = 'Number',
    TEXT = 'Text',
    TEXTAREA = 'Textarea',
    EXPRESSION_PROPERTIES = 'Expression Properties',
}

export enum PropertyChangeType {
    KEY,
    VALUE,
}

export interface IBaseProperty {
    type: PropertyType;
    name?: string;
    key?: string | number;
    isRemovable?: boolean;
    isKeyEditable?: boolean;
    isSimple?: boolean;
}

export interface IPropertyChange {
    type: PropertyChangeType;
    path: string;
    childPath?: string;
    deleteChildPath?: string;
    data: any;
}

export type IProperty =
    | IArrayProperty
    | IBooleanProperty
    | IChipListProperty
    | IObjectProperty
    | IInputProperty
    | IExpressionPropertiesProperty;
