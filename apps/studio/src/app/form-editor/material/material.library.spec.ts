import type { FormlyFieldConfig } from '@ngx-formly/core';
import { describe, expect, it } from 'vitest';
import { materialFormEditorConfig } from './material.library';
import { materialBasicFieldTypeOptions, materialContainerTypeOptions } from './material.options';

const fieldTypes = materialFormEditorConfig.fieldCategoryOptions.flatMap(
  (category) => category.children,
);
const getFieldType = (name: string) => fieldTypes.find((field) => field.name === name);
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

describe('materialFormEditorConfig', () => {
  it('exposes reusable Material field and container options', () => {
    expect(
      materialFormEditorConfig.fieldCategoryOptions.map(({ displayName }) => displayName),
    ).toEqual(['Form Controls', 'Containers']);
    expect(materialFormEditorConfig.fieldCategoryOptions[0].children).toBe(
      materialBasicFieldTypeOptions,
    );
    expect(materialFormEditorConfig.fieldCategoryOptions[1].children).toBe(
      materialContainerTypeOptions,
    );
  });

  it('provides a showcase for every registered Material field type', () => {
    const showcase = materialFormEditorConfig.formTemplates?.[0];

    expect(showcase?.name).toBe('Material Showcase');
    expect(new Set(collectFieldTypes(showcase?.fields ?? []))).toEqual(
      new Set([
        'formly-group',
        'input',
        'string',
        'number',
        'textarea',
        'datepicker',
        'multicheckbox',
        'toggle',
        'checkbox',
        'radio',
        'select',
      ]),
    );
  });

  it('keeps validation controls out of general field properties', () => {
    const validationKeys = new Set([
      'props.required',
      'props.min',
      'props.max',
      'props.minLength',
      'props.maxLength',
      'props.pattern',
      'validation.show',
      'validation.messages',
      'validators.validation',
      'asyncValidators.validation',
    ]);

    const misplacedKeys = fieldTypes
      .flatMap((field) => field.properties ?? [])
      .map(({ key }) => key)
      .filter((key) => key && validationKeys.has(key));

    expect(misplacedKeys).toEqual([]);
  });

  it('exposes applicable built-in validation controls by field type', () => {
    expect(
      getFieldType('input')?.validationConfig?.rules.map(({ name, property }) => [
        name,
        property.key,
      ]),
    ).toEqual([
      ['required', 'props.required'],
      ['minLength', 'props.minLength'],
      ['maxLength', 'props.maxLength'],
      ['pattern', 'props.pattern'],
    ]);
    expect(
      getFieldType('number')?.validationConfig?.rules.map(({ name, property }) => [
        name,
        property.key,
      ]),
    ).toEqual([
      ['required', 'props.required'],
      ['min', 'props.min'],
      ['max', 'props.max'],
    ]);
    expect(
      getFieldType('input')?.validationConfig?.displayProperties?.map(({ key }) => key),
    ).toEqual(['validation.show']);
    expect(getFieldType('formly-group')?.validationConfig).toBeUndefined();
  });

  it('assigns form-field only to standard Material controls', () => {
    const wrapperNames = (name: string) =>
      getFieldType(name)?.wrapperOptions?.map(({ name: wrapperName }) => wrapperName);

    expect(wrapperNames('input')).toEqual(['form-field']);
    expect(wrapperNames('select')).toEqual(['form-field']);
    expect(wrapperNames('formly-group')).toBeUndefined();
    expect(wrapperNames('repeating-section')).toBeUndefined();
  });

  it('provides starter options for choice fields', () => {
    ['radio', 'select', 'multicheckbox'].forEach((type) => {
      expect(getFieldType(type)?.defaultConfig).toEqual({ props: { options: starterOptions } });
    });
  });

  it('enables table editing for choice field options', () => {
    ['radio', 'select', 'multicheckbox'].forEach((type) => {
      const optionsProperty = getFieldType(type)?.properties?.find(
        ({ key }) => key === 'props.options',
      );

      expect(
        optionsProperty && 'useTableDialog' in optionsProperty
          ? optionsProperty.useTableDialog
          : undefined,
      ).toBe(true);
    });
  });

  it('offers only registered Material sync and async validators', () => {
    const inputValidation = getFieldType('input')?.validationConfig;

    expect(inputValidation?.customValidators?.key).toBe('validators.validation');
    expect(inputValidation?.customValidators?.validationOptions).toEqual([
      { label: 'IP Address', value: 'ip' },
    ]);
    expect(inputValidation?.asyncValidators?.key).toBe('asyncValidators.validation');
    expect(inputValidation?.asyncValidators?.validationOptions).toEqual([
      { label: 'IP Address', value: 'ipAsync' },
    ]);

    const registeredValidators = materialFormEditorConfig.configOptions.flatMap(
      (option) => option.validators?.map(({ name }) => name) ?? [],
    );
    expect(registeredValidators).toEqual(expect.arrayContaining(['ip', 'ipAsync']));
  });
});
