import z from 'zod';
import { FieldCategoryOption, FieldTypeOption, LibraryConfig } from './types';
import { createExpressionsProperty } from '../properties';
import { generateTypeOptionSchema, generateTypeOptionSchemaMap } from './schema';

export const defaultTypeOption = {
  name: '',
  displayName: 'Generic',
  materialSymbol: 'question_mark',
  disableKeyGeneration: true,
  defaultConfig: {},
  properties: [
    createExpressionsProperty({
      label: 'Expressions',
      key: 'expressions',
      description: 'Expressions to dynamically change field and model properties.',
    }),
  ],
};

export const validationMessagesPath = ['validation', 'messages'];

export function getFormSchema(fieldCategoryOptions: FieldCategoryOption[]): z.ZodType {
  const defaultTypeSchema = z.looseObject({
    type: z.undefined('ignore'),
    ...generateTypeOptionSchema(defaultTypeOption, validationMessagesPath),
  });

  const typeSchemaMap = generateTypeOptionSchemaMap(fieldCategoryOptions, validationMessagesPath);
  const typeSchemas = Object.entries(typeSchemaMap).map(([typeName, { typeOption, schema }]) => {
    if ((typeOption as FieldTypeOption).isFieldArray) {
      return z.looseObject({
        type: z.literal(typeName),
        get fieldArray() {
          return fieldSchema;
        },
        ...schema,
      });
    } else if (typeOption.isParent) {
      return z.looseObject({
        type: z.literal(typeName),
        get fieldGroup() {
          return z.array(fieldSchema);
        },
        ...schema,
      });
    }

    return z.looseObject({
      type: z.literal(typeName),
      ...schema,
    });
  });

  let fieldSchema: z.ZodType<Record<string, unknown>>;
  if (typeSchemas.length > 1) {
    fieldSchema = z.union([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      z.discriminatedUnion('type', typeSchemas as any, {
        error: (issue) => {
          if (issue.code === 'invalid_union') {
            const type = (issue.input as { type: string }).type;
            return type !== undefined ? `Unknown field type: '${type}'` : 'ignore';
          }
          return undefined;
        },
      }),
      defaultTypeSchema,
    ]);
  } else if (typeSchemas.length === 1) {
    fieldSchema = z.union([typeSchemas[0], defaultTypeSchema]);
  } else {
    // Fallback if no field types are configured
    fieldSchema = defaultTypeSchema;
  }

  return z.array(fieldSchema);
}

export function createLibrary(
  config: Omit<LibraryConfig, 'schema' | 'defaultTypeOption'>,
): LibraryConfig {
  return {
    ...config,
    defaultTypeOption,
    schema: getFormSchema(config.fieldCategoryOptions),
  };
}
