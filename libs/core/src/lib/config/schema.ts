import { IProperty, getPropertySchema } from '../properties';
import type { FieldValidationConfig } from '../properties/validation-messages/validation.types';
import { FieldCategoryOption, FieldTypeOption } from './types';

import * as z from 'zod';

export function generateTypeOptionSchema(
  {
    properties,
    validationConfig,
  }: {
    properties?: IProperty[];
    validationConfig?: FieldValidationConfig;
  },
  validationMessagesPath: string[],
) {
  // Build a plain nested shape
  const rawShape: Record<string, unknown> = {};
  const validationProperties = validationConfig
    ? [
        ...validationConfig.rules.map(({ property }) => property),
        ...(validationConfig.displayProperties ?? []),
        ...(validationConfig.customValidators ? [validationConfig.customValidators] : []),
        ...(validationConfig.asyncValidators ? [validationConfig.asyncValidators] : []),
      ]
    : [];

  for (const property of [...(properties ?? []), ...validationProperties]) {
    const key = property.key;
    if (!key) {
      throw new Error('Property must have a key defined');
    }

    const schema = getPropertySchema(property);

    // If the key contains dots, set the schema at the nested path
    if (key.includes('.')) {
      const pathParts = key.split('.');
      let current = rawShape;

      // Build nested plain objects
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }

      const lastKey = pathParts[pathParts.length - 1];
      current[lastKey] = schema;
    } else {
      rawShape[key] = schema;
    }
  }

  if (validationConfig) {
    const pathParts = validationMessagesPath;
    let current = rawShape;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
    current[pathParts[pathParts.length - 1]] = z.record(z.string(), z.unknown()).optional();
  }

  const isZodType = (v: unknown): v is z.ZodType => !!v && typeof v === 'object' && '_def' in v;

  // Recursively convert plain nested shapes into zod schemas
  const buildZodFromShape = (node: Record<string, z.ZodType> | z.ZodType): z.ZodType => {
    if (isZodType(node)) return node;

    const childShape: Record<string, z.ZodType> = {};
    let hasRequiredChild = false;

    for (const [k, v] of Object.entries(node)) {
      const childSchema = isZodType(v) ? v : buildZodFromShape(v);
      childShape[k] = childSchema;

      // Check if this child is required (not optional)
      const isOptional = childSchema.safeParse(undefined).success;
      if (!isOptional) {
        hasRequiredChild = true;
      }
    }

    const objectSchema = z.looseObject(childShape);
    // Only make optional if all children are optional
    return hasRequiredChild ? objectSchema : objectSchema.optional();
  };

  // Convert top-level rawShape to zod schemas
  const shape: Record<string, z.ZodType> = {};
  for (const [k, v] of Object.entries(rawShape)) {
    shape[k] = isZodType(v) ? v : buildZodFromShape(v as Record<string, z.ZodType>);
  }

  return shape;
}

export function generateTypeOptionSchemaMap(
  fieldCategoryOptions: FieldCategoryOption[],
  validationMessagesPath: string[],
) {
  // Map to store schemas for each field type
  const schemaMap: Record<
    string,
    { typeOption: FieldTypeOption; schema: Record<string, z.ZodType> }
  > = {};

  // Iterate through all field category options
  for (const category of fieldCategoryOptions) {
    for (const typeOption of category.children) {
      // Store the schema keyed by field type name
      schemaMap[typeOption.name] = {
        typeOption,
        schema: generateTypeOptionSchema(typeOption, validationMessagesPath),
      };
    }
  }

  return schemaMap;
}
