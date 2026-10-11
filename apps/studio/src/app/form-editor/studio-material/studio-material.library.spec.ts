import type { FormlyFieldConfig } from '@ngx-formly/core';
import { describe, expect, it } from 'vitest';
import { materialFormEditorConfig } from '../material/material.library';
import { studioMaterialFormEditorConfig } from './studio-material.library';

const fieldTypes = studioMaterialFormEditorConfig.fieldCategoryOptions.flatMap(
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

describe('studioMaterialFormEditorConfig', () => {
  it('declares the Studio Material profile identity and template ownership', () => {
    expect(studioMaterialFormEditorConfig.id).toBe('form-studio-material');
    expect(studioMaterialFormEditorConfig.label).toBe('Studio Material');
    expect(studioMaterialFormEditorConfig.formTemplates).toHaveLength(3);
    expect(studioMaterialFormEditorConfig.formTemplates?.[0].libraryId).toBe(
      'form-studio-material',
    );
  });

  it('organizes display, form control, and container types into categories', () => {
    expect(
      studioMaterialFormEditorConfig.fieldCategoryOptions.map(({ displayName }) => displayName),
    ).toEqual(['Display', 'Form Controls', 'Containers']);
    expect(
      studioMaterialFormEditorConfig.fieldCategoryOptions[0].children.map(({ name }) => name),
    ).toEqual(['markdown', 'divider']);
    expect(studioMaterialFormEditorConfig.fieldCategoryOptions[1].children).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'markdown' }),
        expect.objectContaining({ name: 'divider' }),
      ]),
    );
  });

  it('places the simple Starter Form before the showcase', () => {
    expect(studioMaterialFormEditorConfig.formTemplates?.map(({ name }) => name)).toEqual([
      'Starter Form',
      'Studio Material Showcase',
      'Expense Report',
    ]);
    expect(studioMaterialFormEditorConfig.formTemplates?.[0]).toMatchObject({
      libraryId: 'form-studio-material',
      fields: [
        {
          key: 'name',
          type: 'input',
          props: { required: true },
        },
        { key: 'email', type: 'input', props: { type: 'email', required: true } },
        { key: 'topic', type: 'select', props: { required: true } },
        { key: 'message', type: 'textarea', props: { required: true, minLength: 10 } },
        { key: 'updates', type: 'checkbox' },
      ],
    });
  });

  it('provides a showcase for every registered Studio Material field type', () => {
    const showcase = studioMaterialFormEditorConfig.formTemplates?.find(
      ({ name }) => name === 'Studio Material Showcase',
    );

    expect(showcase?.name).toBe('Studio Material Showcase');
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
        'button-group',
        'postal-code',
        'markdown',
        'divider',
        'card',
        'repeating-section',
        'step',
        'stepper',
        'tab',
        'tabs',
      ]),
    );
    expect(
      fieldTypes
        .filter((field) => field.wrapperOptions)
        .flatMap((field) => field.wrapperOptions?.map(({ name }) => name) ?? []),
    ).toEqual(expect.arrayContaining(['form-field', 'card']));
  });

  it('organizes showcase fields as cards in a responsive root grid', () => {
    const showcase = studioMaterialFormEditorConfig.formTemplates?.find(
      ({ name }) => name === 'Studio Material Showcase',
    );
    const root = showcase?.fields?.[0];
    const showcaseCards = root?.fieldGroup ?? [];
    const findCard = (title: string) =>
      showcaseCards.find((field) => field.props?.['cardTitle'] === title);

    expect(root).toMatchObject({
      type: 'formly-group',
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    });
    expect(showcaseCards).toHaveLength(19);
    expect(showcaseCards.every((field) => field.type === 'card')).toBe(true);
    expect(showcaseCards.every((field) => field.props?.['cardTitle'])).toBe(true);
    expect(showcaseCards.every((field) => field.props?.['cardSubtitle'])).toBe(true);
    expect(findCard('Markdown')?.fieldGroup?.[0].props?.['text']).toContain(
      '**bold text**, *emphasis*',
    );
    expect(findCard('Markdown')?.fieldGroup?.[0].props?.['text']).toContain(
      '| Feature | Supported |',
    );
    expect(findCard('Markdown')?.fieldGroup?.[0].props?.['text']).toContain('```typescript');

    expect(
      [
        'Input',
        'Text',
        'Number',
        'Textarea',
        'Date',
        'Select',
        'Radio',
        'Multi Checkbox',
        'Checkbox',
        'Toggle',
        'Button Group',
        'Postal Code',
      ].map((title) => findCard(title)?.className),
    ).toEqual(Array(12).fill('col-span-1'));
    expect(
      ['Markdown', 'Divider', 'Group', 'Card', 'Repeater', 'Stepper', 'Tabs'].map(
        (title) => findCard(title)?.className,
      ),
    ).toEqual(Array(7).fill('col-span-1 md:col-span-2'));

    expect(findCard('Card')).toMatchObject({ type: 'card', fieldGroup: [] });
    expect(findCard('Group')?.fieldGroup?.[0]).toMatchObject({
      type: 'formly-group',
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    });
    expect(findCard('Repeater')?.fieldGroup?.[0]).toMatchObject({
      type: 'repeating-section',
      fieldArray: { fieldGroup: expect.any(Array) },
    });
    expect(findCard('Stepper')?.fieldGroup?.[0]?.fieldGroup?.[0]).toMatchObject({
      type: 'step',
    });
    expect(findCard('Tabs')?.fieldGroup?.[0]?.fieldGroup?.[0]).toMatchObject({
      type: 'tab',
    });
  });

  it('adds custom fields without mutating the standard Material profile', () => {
    expect(getFieldType('button-group')).toBeDefined();
    expect(getFieldType('card')).toBeDefined();
    expect(getFieldType('divider')).toBeDefined();
    expect(getFieldType('markdown')).toBeDefined();
    expect(getFieldType('postal-code')).toBeDefined();
    expect(getFieldType('step')).toBeDefined();
    expect(getFieldType('stepper')).toBeDefined();
    expect(getFieldType('tab')).toBeDefined();
    expect(getFieldType('tabs')).toBeDefined();
    expect(
      materialFormEditorConfig.fieldCategoryOptions
        .flatMap((category) => category.children)
        .some((field) =>
          [
            'button-group',
            'card',
            'divider',
            'markdown',
            'postal-code',
            'step',
            'stepper',
            'tab',
            'tabs',
          ].includes(field.name),
        ),
    ).toBe(false);
    expect(fieldTypes.length).toBe(
      materialFormEditorConfig.fieldCategoryOptions.reduce(
        (count, category) => count + category.children.length,
        0,
      ) + 10,
    );
  });

  it('exposes Markdown text editing metadata', () => {
    const markdown = getFieldType('markdown');

    expect(markdown).toMatchObject({
      displayName: 'Markdown',
      name: 'markdown',
      disableKeyGeneration: true,
      defaultConfig: {
        props: {
          text: '## Markdown\n\nWrite formatted content here.',
        },
      },
    });
    expect(markdown?.properties?.map(({ key, type }) => [key, type])).toEqual([
      ['props.text', 'Markdown'],
      ['hide', 'Boolean'],
      ['expressions', 'Expressions'],
    ]);
  });

  it('exposes Divider presentation metadata', () => {
    const divider = getFieldType('divider');

    expect(divider).toMatchObject({
      displayName: 'Divider',
      name: 'divider',
      materialSymbol: 'horizontal_rule',
      disableKeyGeneration: true,
      defaultConfig: {
        props: {},
      },
    });
    expect(divider?.properties?.map(({ key, type }) => [key, type])).toEqual([
      ['props.vertical', 'Boolean'],
      ['props.inset', 'Boolean'],
      ['hide', 'Boolean'],
      ['expressions', 'Expressions'],
    ]);
  });

  it('retains inherited choice defaults and provides Button Group defaults', () => {
    ['radio', 'select', 'multicheckbox'].forEach((type) => {
      expect(getFieldType(type)?.defaultConfig).toEqual({ props: { options: starterOptions } });
      expect(getFieldType(type)?.defaultConfig).toBe(
        materialFormEditorConfig.fieldCategoryOptions
          .flatMap((category) => category.children)
          .find((field) => field.name === type)?.defaultConfig,
      );
    });
    expect(getFieldType('button-group')?.defaultConfig).toEqual({
      props: { options: starterOptions },
    });
  });

  it('exposes scalar Button Group properties and option metadata', () => {
    const buttonGroup = getFieldType('button-group');
    const optionsProperty = buttonGroup?.properties?.find(({ key }) => key === 'props.options');

    expect(buttonGroup?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'defaultValue',
      'props.label',
      'props.description',
      'hide',
      'props.options',
      'expressions',
    ]);
    expect(
      buttonGroup?.validationConfig?.rules.map(({ name, property }) => [name, property.key]),
    ).toEqual([['required', 'props.required']]);
    const childProperty =
      optionsProperty && 'childProperty' in optionsProperty
        ? optionsProperty.childProperty
        : undefined;

    expect(
      childProperty && 'childProperties' in childProperty
        ? childProperty.childProperties.map(({ key }) => key)
        : undefined,
    ).toEqual(['label', 'value', 'disabled']);
    expect(
      optionsProperty && 'useTableDialog' in optionsProperty
        ? optionsProperty.useTableDialog
        : undefined,
    ).toBe(true);
  });

  it('registers custom runtime types alongside standard Material types', () => {
    const typeNames = studioMaterialFormEditorConfig.configOptions.flatMap(
      (option) => option.types?.map((type) => type.name) ?? [],
    );

    expect(typeNames).toContain('button-group');
    expect(typeNames).toContain('card');
    expect(typeNames).toContain('divider');
    expect(typeNames).toContain('markdown');
    expect(typeNames).toContain('postal-code');
    expect(typeNames).toContain('repeating-section');
    expect(typeNames).toContain('step');
    expect(typeNames).toContain('stepper');
    expect(typeNames).toContain('input');
    expect(typeNames).toContain('select');

    const cardType = studioMaterialFormEditorConfig.configOptions
      .flatMap((option) => option.types ?? [])
      .find((type) => type.name === 'card');
    expect(cardType).toEqual({
      name: 'card',
      extends: 'formly-group',
      wrappers: ['card'],
    });
  });

  it('exposes generic Postal Code configuration and regional presets', () => {
    const postalCode = getFieldType('postal-code');

    expect(postalCode?.defaultConfig).toEqual({});
    expect(postalCode?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'defaultValue',
      'props.label',
      'props.placeholder',
      'props.description',
      'props.mask',
      'props.inputMode',
      'props.autoCapitalize',
      'props.storeRawValue',
      'props.autocompleteContext',
      'hide',
      'expressions',
    ]);
    expect(
      postalCode?.validationConfig?.rules.map(({ name, property }) => [name, property.key]),
    ).toEqual([
      ['required', 'props.required'],
      ['postalCodePattern', 'props.postalCodePattern'],
    ]);
    expect(postalCode?.initialPresets).toMatchObject([
      {
        id: 'us-zip-code',
        displayName: 'US ZIP Code',
        isRemovable: false,
        field: {
          type: 'postal-code',
          props: { label: 'ZIP Code', mask: '00000', inputMode: 'numeric' },
        },
      },
      {
        id: 'canada-postal-code',
        displayName: 'Canada Postal Code',
        isRemovable: false,
        field: {
          type: 'postal-code',
          props: { label: 'Postal Code', mask: 'A0A 0A0', inputMode: 'text' },
        },
      },
    ]);
  });

  it('exposes Card as a grouped container without wrapper options', () => {
    const card = getFieldType('card');

    expect(card).toMatchObject({
      displayName: 'Card',
      name: 'card',
      materialSymbol: 'credit_card',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: { fieldGroup: [] },
    });
    expect(card?.wrapperOptions).toBeUndefined();
    expect(card?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.cardTitle',
      'props.cardSubtitle',
      'hide',
      'expressions',
    ]);
  });

  it('exposes the Material wrappers for Studio Material fields', () => {
    expect(getFieldType('button-group')?.wrapperOptions?.map(({ name }) => name)).toEqual(
      materialFormEditorConfig.fieldCategoryOptions[0].children[0].wrapperOptions?.map(
        ({ name }) => name,
      ),
    );
    expect(getFieldType('formly-group')?.wrapperOptions?.map(({ name }) => name)).toEqual(['card']);
    expect(getFieldType('repeating-section')?.wrapperOptions?.map(({ name }) => name)).toEqual([
      'card',
    ]);
    expect(
      getFieldType('formly-group')?.wrapperOptions?.[0].properties?.map(({ key }) => key),
    ).toEqual(['props.cardTitle', 'props.cardSubtitle']);
  });
});
