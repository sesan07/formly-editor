import type { FormlyFieldConfig } from '@ngx-formly/core';
import { describe, expect, it } from 'vitest';
import { ngZorroFormEditorConfig } from './ng-zorro.library';

const fieldTypes = ngZorroFormEditorConfig.fieldCategoryOptions.flatMap((category) =>
  category.children.map((field) => field.name),
);
const fieldTypeOptions = ngZorroFormEditorConfig.fieldCategoryOptions.flatMap(
  (category) => category.children,
);
const starterOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
];
const collectFieldTypes = (fields: FormlyFieldConfig[]): string[] =>
  fields.flatMap((field) => [
    ...(typeof field.type === 'string' ? [field.type] : []),
    ...(field.fieldGroup ? collectFieldTypes(field.fieldGroup) : []),
    ...(typeof field.fieldArray !== 'function' && field.fieldArray?.fieldGroup
      ? collectFieldTypes(field.fieldArray.fieldGroup)
      : []),
  ]);

describe('ngZorroFormEditorConfig', () => {
  it('declares the stable profile identity and template ownership', () => {
    expect(ngZorroFormEditorConfig.id).toBe('form-ng-zorro');
    expect(ngZorroFormEditorConfig.label).toBe('Ng Zorro');
    expect(ngZorroFormEditorConfig.formTemplates).toHaveLength(1);
    expect(ngZorroFormEditorConfig.formTemplates?.[0].libraryId).toBe('form-ng-zorro');
  });

  it('organizes controls and containers into categories', () => {
    expect(
      ngZorroFormEditorConfig.fieldCategoryOptions.map(({ displayName }) => displayName),
    ).toEqual(['Form Controls', 'Containers']);
  });

  it('exposes only the supported Ng Zorro field catalog', () => {
    expect(fieldTypes).toEqual([
      'input',
      'number',
      'textarea',
      'select',
      'radio',
      'checkbox',
      'formly-group',
    ]);
    expect(fieldTypes).not.toContain('datepicker');
    expect(fieldTypes).not.toContain('toggle');
  });

  it('provides a showcase for every registered Ng Zorro field type', () => {
    const showcase = ngZorroFormEditorConfig.formTemplates?.[0];

    expect(showcase?.name).toBe('Ng Zorro Showcase');
    expect(new Set(collectFieldTypes(showcase?.fields ?? []))).toEqual(
      new Set(['input', 'number', 'textarea', 'select', 'radio', 'checkbox', 'formly-group']),
    );
  });

  it('provides the Ng Zorro form-field wrapper and group defaults', () => {
    const input = fieldTypeOptions.find(({ name }) => name === 'input');
    expect(input?.wrapperOptions).toEqual([
      expect.objectContaining({ name: 'form-field', label: 'Form Field' }),
    ]);

    const group = ngZorroFormEditorConfig.fieldCategoryOptions[1].children[0];
    expect(group.name).toBe('formly-group');
    expect(group.isParent).toBe(true);
    expect(group.defaultConfig).toEqual({ fieldGroup: [] });
    expect(group.wrapperOptions).toBeUndefined();
  });

  it('provides starter options for supported choice fields', () => {
    ['radio', 'select'].forEach((type) => {
      expect(fieldTypeOptions.find(({ name }) => name === type)?.defaultConfig).toEqual({
        props: { options: starterOptions },
      });
    });
  });

  it('enables table editing for choice field options', () => {
    ['radio', 'select'].forEach((type) => {
      const optionsProperty = fieldTypeOptions
        .find(({ name }) => name === type)
        ?.properties?.find(({ key }) => key === 'props.options');

      expect(
        optionsProperty && 'useTableDialog' in optionsProperty
          ? optionsProperty.useTableDialog
          : undefined,
      ).toBe(true);
    });
  });

  it('registers the official adapter config options', () => {
    const typeNames = ngZorroFormEditorConfig.configOptions.flatMap(
      (option) => option.types?.map((type) => type.name) ?? [],
    );

    expect(typeNames).toEqual(
      expect.arrayContaining([
        'input',
        'string',
        'number',
        'integer',
        'textarea',
        'select',
        'enum',
        'radio',
        'checkbox',
        'boolean',
      ]),
    );
  });

  it('separates validation controls from general properties', () => {
    const input = fieldTypeOptions.find(({ name }) => name === 'input');
    const number = fieldTypeOptions.find(({ name }) => name === 'number');

    expect(input?.properties?.map(({ key }) => key)).not.toContain('props.required');
    expect(
      input?.validationConfig?.rules.map(({ name, property }) => [name, property.key]),
    ).toEqual([['required', 'props.required']]);
    expect(
      number?.validationConfig?.rules.map(({ name, property }) => [name, property.key]),
    ).toEqual([
      ['min', 'props.min'],
      ['max', 'props.max'],
      ['required', 'props.required'],
    ]);
    expect(input?.validationConfig?.displayProperties?.map(({ key }) => key)).toEqual([
      'validation.show',
    ]);
    expect(input?.validationConfig?.customValidators).toBeUndefined();
    expect(input?.validationConfig?.asyncValidators).toBeUndefined();
    expect(
      fieldTypeOptions
        .flatMap(({ properties }) => properties ?? [])
        .map(({ key }) => key)
        .filter((key) => key?.startsWith('validation.') || key === 'props.required'),
    ).toEqual([]);
  });
});
