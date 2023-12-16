import { IBooleanProperty } from './boolean-property/boolean-property.types';
import { IChipListProperty } from './chip-list-property/chip-list-property.types';
import { IArrayProperty } from './cyclic-properties/array-property.types';
import { IObjectProperty } from './cyclic-properties/object-property.types';
import { IValidatorsProperty } from './cyclic-properties/validators-property.types';
import { IExpressionPropertiesProperty } from './expression-properties-property/expression-properties-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { ISelectProperty } from './select-property/select-property.types';

export enum PropertyType {
    ARRAY = 'Array',
    BOOLEAN = 'Boolean',
    CHIP_LIST = 'Chip List',
    EXPRESSION_PROPERTIES = 'Expression Properties',
    OBJECT = 'Object',
    NUMBER = 'Number',
    SELECT = 'Select',
    TEXT = 'Text',
    TEXTAREA = 'Textarea',
    VALIDATORS = 'Validators',
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
}

export interface IPropertyChange {
    type: PropertyChangeType;
    path: string[];
    newPath?: string[];
    value?: any;
}

export type IProperty =
    | IArrayProperty
    | IBooleanProperty
    | IChipListProperty
    | IObjectProperty
    | IInputProperty
    | ISelectProperty
    | IExpressionPropertiesProperty
    | IValidatorsProperty;

export type PropertyCreator<T extends IBaseProperty> = (property: Omit<T, 'type'>) => T;
