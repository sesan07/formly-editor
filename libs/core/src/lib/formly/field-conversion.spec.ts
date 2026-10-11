import { describe, expect, it } from 'vitest';
import type { FieldTypeOption } from '../config/types';
import { convertField, generateFieldId, generateFormId } from './field-conversion';
import { createLibrary, getFormSchema } from '../config/library';

const inputTypeOption: FieldTypeOption = {
  displayName: 'Input',
  name: 'input',
  materialSymbol: 'text_fields',
  defaultConfig: { type: 'input' },
};

const groupTypeOption: FieldTypeOption = {
  displayName: 'Group',
  name: 'group',
  materialSymbol: 'group',
  defaultConfig: { type: 'group', fieldGroup: [] },
  isParent: true,
};

const arrayTypeOption: FieldTypeOption = {
  displayName: 'Array',
  name: 'array',
  materialSymbol: 'list',
  defaultConfig: { type: 'array', fieldArray: { type: 'input' } },
  isFieldArray: true,
};

const choiceTypeOption: FieldTypeOption = {
  displayName: 'Choice',
  name: 'choice',
  materialSymbol: 'list',
  defaultConfig: {
    type: 'choice',
    props: {
      options: [
        { label: 'Default 1', value: 'default1' },
        { label: 'Default 2', value: 'default2' },
      ],
      nested: {
        defaultValue: true,
      },
      values: ['default'],
    },
  },
};

const fieldTypeOptions = [inputTypeOption, groupTypeOption, arrayTypeOption, choiceTypeOption];

function convertChoiceField(sourceField: Parameters<typeof convertField>[0]) {
  const fieldMap: Record<string, ReturnType<typeof convertField>> = {};

  return convertField(sourceField, 'choice-1', 'form-1', [], fieldMap, fieldTypeOptions, () =>
    structuredClone(choiceTypeOption.defaultConfig),
  );
}

describe('form-editor utils', () => {
  it('generates prefixed ids', () => {
    expect(generateFormId()).toMatch(/^form-/);
    expect(generateFieldId('input')).toMatch(/^input-/);
    expect(generateFieldId(undefined)).toMatch(/^generic-/);
  });

  it('converts nested field groups into editor fields', () => {
    const fieldMap: Record<string, ReturnType<typeof convertField>> = {};
    const editorField = convertField(
      {
        type: 'group',
        fieldGroup: [
          {
            type: 'input',
            key: 'firstName',
          },
        ],
      },
      'group-1',
      'form-1',
      [],
      fieldMap,
      fieldTypeOptions,
      (type) => ({ type }),
    );

    expect(editorField._info.id).toBe('group-1');
    expect(editorField._info.isParent).toBe(true);
    expect(editorField._info.childIds).toHaveLength(1);

    const child = fieldMap[editorField._info.childIds[0]];
    expect(child._info.idPath).toEqual(['group-1', child._info.id]);
    expect(child.key).toBe('firstName');
  });

  it('converts array fields into editor fields', () => {
    const fieldMap: Record<string, ReturnType<typeof convertField>> = {};
    const editorField = convertField(
      {
        type: 'array',
        fieldArray: {
          type: 'input',
          key: 'item',
        },
      },
      'array-1',
      'form-1',
      [],
      fieldMap,
      fieldTypeOptions,
      (type) => ({ type }),
    );

    expect(editorField._info.isFieldArray).toBe(true);
    expect(editorField._info.childIds).toHaveLength(1);
    expect(fieldMap[editorField._info.childIds[0]].key).toBe('item');
  });

  it('inherits default options when source options are omitted or undefined', () => {
    expect(convertChoiceField({ type: 'choice' }).props?.['options']).toEqual([
      { label: 'Default 1', value: 'default1' },
      { label: 'Default 2', value: 'default2' },
    ]);
    expect(
      convertChoiceField({ type: 'choice', props: { options: undefined } }).props?.['options'],
    ).toEqual([
      { label: 'Default 1', value: 'default1' },
      { label: 'Default 2', value: 'default2' },
    ]);
  });

  it('replaces default arrays when source arrays are explicitly supplied', () => {
    expect(
      convertChoiceField({ type: 'choice', props: { options: [] } }).props?.['options'],
    ).toEqual([]);

    const explicitOptions = [{ label: 'Custom', value: 'custom' }];
    const editorField = convertChoiceField({
      type: 'choice',
      props: {
        options: explicitOptions,
        nested: {
          sourceValue: true,
        },
        values: ['custom'],
      },
    });

    expect(editorField.props?.['options']).toEqual(explicitOptions);
    expect(editorField.props?.['options']).not.toBe(explicitOptions);
    expect(editorField.props?.['nested']).toEqual({
      defaultValue: true,
      sourceValue: true,
    });
    expect(editorField.props?.['values']).toEqual(['custom']);
  });

  it('generates a schema that accepts configured types', () => {
    const schema = getFormSchema([
      {
        displayName: 'Basic',
        children: fieldTypeOptions,
      },
    ]);

    expect(schema.safeParse([{ type: 'input' }]).success).toBe(true);
    expect(schema.safeParse([{ type: 'group', fieldGroup: [{ type: 'input' }] }]).success).toBe(
      true,
    );
    expect(schema.safeParse([{ type: 'unknown' }]).success).toBe(false);
  });

  it('preserves explicit builder options separately from library options', () => {
    const runtimeOption = { types: [{ name: 'runtime-type' }] };
    const builderOption = { types: [{ name: 'builder-type' }] };
    const library = createLibrary({
      id: 'test-library',
      label: 'Test Library',
      configOptions: [runtimeOption],
      fieldCategoryOptions: [
        {
          displayName: 'Fields',
          children: [inputTypeOption],
        },
      ],
      formTemplates: [],
      builderConfigOptions: [builderOption],
    });

    expect(library.configOptions).toEqual([runtimeOption]);
    expect(library.builderConfigOptions).toEqual([builderOption]);
  });
});
