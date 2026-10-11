import { ArrayPropertyConfig } from './array.config';
import { ObjectPropertyConfig } from '../object/object.config';
import { PropertyConfig, PropertyType } from '../types';

type TableDialogPropertyConfig = ArrayPropertyConfig & {
  childProperty: ObjectPropertyConfig;
};

const TABLE_COLUMN_TYPES = new Set<PropertyType>([
  PropertyType.BOOLEAN,
  PropertyType.INPUT,
  PropertyType.SELECT,
]);

export function isTableDialogProperty(
  property: PropertyConfig,
): property is TableDialogPropertyConfig {
  if (property.type !== PropertyType.ARRAY) {
    return false;
  }

  const arrayProperty = property as ArrayPropertyConfig;
  if (
    arrayProperty.useTableDialog !== true ||
    arrayProperty.childProperty?.type !== PropertyType.OBJECT
  ) {
    return false;
  }

  const childProperty = arrayProperty.childProperty as ObjectPropertyConfig;
  const childProperties = childProperty.childProperties;
  return (
    Array.isArray(childProperties) &&
    childProperties.length > 0 &&
    childProperties.every(
      (childProperty) =>
        typeof childProperty.key === 'string' &&
        childProperty.key.length > 0 &&
        TABLE_COLUMN_TYPES.has(childProperty.type),
    )
  );
}

export function isTableRow(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
