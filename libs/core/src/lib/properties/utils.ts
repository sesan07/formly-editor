import { get, set, unset } from 'lodash-es';
import { create } from 'mutative';

import { TrackByFunction } from '@angular/core';
import z from 'zod';
import type { ArrayPropertyConfig } from './array/array.config';
import type { BooleanPropertyConfig } from './boolean/boolean.config';
import type { ChipsPropertyConfig } from './chips/chips.config';
import type { DatePropertyConfig } from './date/date.config';
import type { InputPropertyConfig } from './input/input.config';
import type { MarkdownPropertyConfig } from './markdown/markdown.config';
import type { ObjectPropertyConfig } from './object/object.config';
import type { SelectPropertyConfig, SelectPropertyOption } from './select/select.config';
import {
  BasePropertyConfig,
  PropertyChange,
  PropertyChangeType,
  PropertyConfig,
  PropertyType,
} from './types';

export const trackByPropertyKey: TrackByFunction<PropertyConfig> = (_, property: PropertyConfig) =>
  property.key;

export function getChildPath(path: string[], key: string | number | undefined): string[] {
  if (key === undefined) {
    throw new Error('key is undefined');
  }
  return [...path, ...key.toString().split('.')];
}

const modifyTargetKey = <T extends Record<string, unknown>>(
  target: T,
  { path, newPath }: Omit<PropertyChange, 'type'>,
): T => {
  if (!newPath?.length) {
    throw new Error('Unable to modify target key without newPath');
  }

  const oldKey = path[path.length - 1];
  const newKey = newPath[path.length - 1];

  // Modify key without changing position in object
  const modifyKey = (p: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(p).map(([k, v]) => [k === oldKey ? newKey : k, v]));

  if (newPath.length > 1) {
    const parentPath = newPath.slice(0, -1);
    const parent = get(target, parentPath);
    const newParent = modifyKey(parent);

    return create(target, (draft) => {
      set(draft, parentPath, newParent);
    });
  } else {
    return modifyKey(target) as T;
  }
};

const modifyTargetValue = <T extends Record<string, unknown>>(
  target: T,
  { path, value }: Omit<PropertyChange, 'type'>,
): T =>
  create(target, (draft) => {
    set(draft, path, value);
  });

const modifyTargetClear = <T extends Record<string, unknown>>(
  target: T,
  { path }: Omit<PropertyChange, 'type'>,
): T =>
  create(target, (draft) => {
    unset(draft, path);
  });

export const modifyPropertyTarget = <T extends Record<string, unknown>>(
  target: T,
  { type, ...change }: PropertyChange,
): T => {
  switch (type) {
    case PropertyChangeType.KEY:
      return modifyTargetKey(target, change);
    case PropertyChangeType.VALUE:
      return modifyTargetValue(target, change);
    case PropertyChangeType.CLEAR:
      return modifyTargetClear(target, change);
  }
};

export const getDefaultProperty = (
  type: PropertyType,
  key = '',
  dataType: 'text' | 'number' = 'text',
  childPropertyType?: PropertyType,
): PropertyConfig => {
  // Properties added by the user should have editable keys and be deletable
  const baseProperty: BasePropertyConfig = {
    type,
    key,
    isKeyEditable: true,
    isRemovable: true,
  };

  switch (type) {
    case PropertyType.BOOLEAN: {
      const property: BooleanPropertyConfig = { ...baseProperty, type: PropertyType.BOOLEAN };
      return property;
    }
    case PropertyType.INPUT: {
      const property: InputPropertyConfig = {
        ...baseProperty,
        type: PropertyType.INPUT,
        dataType,
      };
      return property;
    }
    case PropertyType.MARKDOWN: {
      const property: MarkdownPropertyConfig = {
        ...baseProperty,
        type: PropertyType.MARKDOWN,
      };
      return property;
    }
    case PropertyType.DATE: {
      const property: DatePropertyConfig = { ...baseProperty, type: PropertyType.DATE };
      return property;
    }
    case PropertyType.OBJECT: {
      const property: ObjectPropertyConfig = {
        ...baseProperty,
        type: PropertyType.OBJECT,
        childProperties: [],
        populateChildrenFromTarget: true,
      };
      return property;
    }
    case PropertyType.ARRAY: {
      const property: ArrayPropertyConfig = {
        ...baseProperty,
        type: PropertyType.ARRAY,
        canAdd: true,
        childProperty: childPropertyType ? getDefaultProperty(childPropertyType) : undefined,
      };
      return property;
    }
    default:
      throw new Error(`Property type ${type} does not have a default property`);
  }
};

export const getDefaultPropertyFromValue = (
  value: unknown,
  key?: string,
): PropertyConfig | undefined => {
  const propertyType: PropertyType | undefined = getPropertyType(value);
  if (!propertyType) {
    return undefined;
  }

  // Determine input data type
  let dataType: 'text' | 'number' = 'text';
  if (propertyType === PropertyType.INPUT) {
    dataType = typeof value === 'number' ? 'number' : 'text';
  }

  return getDefaultProperty(propertyType, key, dataType);
};

export const getDefaultPropertyValue = (
  type: PropertyType,
  dataType?: 'text' | 'number',
): unknown => {
  switch (type) {
    case PropertyType.ARRAY:
      return [];
    case PropertyType.OBJECT:
      return {};
    case PropertyType.BOOLEAN:
      return false;
    case PropertyType.DATE:
      return new Date();
    case PropertyType.INPUT:
      return dataType === 'number' ? 0 : '';
    case PropertyType.MARKDOWN:
      return '';
    case PropertyType.SELECT:
      return null;
    default:
      throw new Error(`Property type ${type} does not have a default value`);
  }
};

const getPropertyType = (value: unknown): PropertyType | undefined => {
  switch (typeof value) {
    case 'object':
      if (value === null) {
        return undefined;
      } else if (Array.isArray(value)) {
        return PropertyType.ARRAY;
      } else if (value instanceof Date) {
        return PropertyType.DATE;
      }

      return PropertyType.OBJECT;
    case 'boolean':
      return PropertyType.BOOLEAN;
    case 'number':
    case 'string':
      return PropertyType.INPUT;
    default:
      return undefined;
  }
};

/**
 * Convert an IProperty configuration to a Zod schema for validation.
 * @param property - The property configuration to convert
 * @returns A Zod schema that validates against the property structure
 */
export function getPropertySchema(property: PropertyConfig): z.ZodType {
  let schema: z.ZodType;

  switch (property.type) {
    case PropertyType.BOOLEAN:
      schema = z.boolean();
      break;

    case PropertyType.DATE:
      schema = z.string();
      break;

    case PropertyType.INPUT: {
      const inputProp = property as InputPropertyConfig;
      schema = inputProp.dataType === 'number' ? z.number() : z.string();
      break;
    }

    case PropertyType.MARKDOWN:
      schema = z.string();
      break;

    case PropertyType.OBJECT: {
      const objProp = property as ObjectPropertyConfig;
      const shape: Record<string, z.ZodType> = {};

      if (objProp.childProperties) {
        for (const childProp of objProp.childProperties) {
          if (!childProp.key) {
            throw new Error('Child property of an object must have a key defined');
          }
          shape[childProp.key] = getPropertySchema(childProp);
        }
      }

      schema = z.object(shape);
      break;
    }

    case PropertyType.ARRAY: {
      const arrProp = property as ArrayPropertyConfig;
      const childSchema = arrProp.childProperty
        ? getPropertySchema(arrProp.childProperty)
        : z.unknown();

      schema = z.array(childSchema);
      break;
    }

    case PropertyType.SELECT: {
      const selectProp = property as SelectPropertyConfig;
      const validValues = selectProp.options.map((opt: SelectPropertyOption) => opt.value);
      schema = z.union(validValues.map((val: string | number) => z.literal(val)));
      break;
    }

    case PropertyType.CHIPS: {
      const chipsProp = property as ChipsPropertyConfig;
      // Chips are stored as arrays of strings, but can be output as a single string if outputString is configured
      schema = chipsProp.outputString ? z.string() : z.array(z.string());
      break;
    }

    case PropertyType.EXPRESSIONS: {
      // Expressions are key-value pairs (key: string, value: expression string)
      schema = z.record(z.string(), z.string());
      break;
    }

    case PropertyType.VALIDATION_MESSAGES: {
      // Validation messages are key-value pairs (validator key: error message)
      schema = z.record(z.string(), z.string());
      break;
    }

    case PropertyType.CUSTOM_VALIDATION: {
      // Custom validation produces an array of validation configurations (objects or strings)
      schema = z.array(
        z.union([
          z.object({
            name: z.string(),
            options: z.record(z.string(), z.unknown()).optional(),
          }),
          z.string(),
        ]),
      );
      break;
    }

    default:
      throw new Error(`Unknown property type: ${property.type}`);
  }

  // Apply isRequired flag: if not required, make the schema optional
  return property.isRequired ? schema : schema.optional();
}
