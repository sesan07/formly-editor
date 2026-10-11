import { TestBed } from '@angular/core/testing';
import { withStepperTypeBuilder, withTabsTypeBuilder } from '@formly-editor/builder-material';
import {
  BuilderFieldStateService,
  CoreFormService,
  CoreLibraryService,
  PropertyChangeType,
  provideCore,
  provideCoreConfig,
  provideLocalFormStore,
} from '@formly-editor/core';
import { withStepperType, withTabsType } from '@formly-editor/material';
import { FormlyConfig, FormlyFieldConfig, provideFormlyCore } from '@ngx-formly/core';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { materialFormEditorConfig } from '../material/material.library';
import { studioMaterialFormEditorConfig } from './studio-material.library';

const studioMaterialForm = {
  id: 'studio-material-button-group',
  libraryId: 'form-studio-material',
  name: 'Studio Material Button Group',
  model: { density: 'comfortable' },
  fields: [
    {
      type: 'button-group',
      key: 'density',
      defaultValue: 'comfortable',
      props: {
        label: 'Density',
        options: [
          { label: 'Compact', value: 'compact' },
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Spacious', value: 'spacious', disabled: true },
        ],
      },
    },
  ],
};

const studioMaterialCardForm = {
  id: 'studio-material-card',
  libraryId: 'form-studio-material',
  name: 'Studio Material Card',
  model: { firstName: 'Ada' },
  fields: [
    {
      type: 'card',
      props: {
        cardTitle: 'Profile',
        cardSubtitle: 'Personal details',
      },
      fieldGroup: [
        {
          type: 'input',
          key: 'firstName',
          props: {
            label: 'First name',
          },
        },
      ],
    },
  ],
};

const studioMaterialPostalCodeForm = {
  id: 'studio-material-postal-code',
  libraryId: 'form-studio-material',
  name: 'Studio Material Postal Code',
  model: { postalCode: 'K1A0B1' },
  fields: [
    {
      type: 'postal-code',
      key: 'postalCode',
      props: {
        label: 'Postal Code',
        mask: 'A0A 0A0',
        inputMode: 'text',
        autoCapitalize: true,
        storeRawValue: true,
        autocompleteContext: 'shipping',
        postalCodePattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$',
      },
    },
  ],
};

const studioMaterialStepperForm = {
  id: 'studio-material-stepper',
  libraryId: 'form-studio-material',
  name: 'Stepper',
  model: { country: 'Canada', firstName: 'Ada' },
  fields: [
    {
      type: 'stepper',
      props: {
        ariaLabel: 'Travel details',
        linear: true,
        orientation: 'vertical',
      },
      fieldGroup: [
        {
          type: 'step',
          props: {
            label: 'Personal data',
            nextButtonLabel: 'Continue',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: {
                label: 'First name',
                required: true,
              },
            },
          ],
        },
        {
          type: 'step',
          props: {
            label: 'Destination',
            optional: true,
            previousButtonLabel: 'Return',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'country',
              props: { label: 'Country' },
            },
          ],
        },
      ],
    },
  ],
};

const studioMaterialTabsForm = {
  id: 'studio-material-tabs',
  libraryId: 'form-studio-material',
  name: 'Tabs',
  model: { firstName: 'Ada', country: 'Canada' },
  fields: [
    {
      type: 'tabs',
      props: {
        alignTabs: 'center',
        dynamicHeight: true,
        fitInkBarToContent: true,
        headerPosition: 'below',
        preserveContent: false,
        disableStretchTabs: true,
      },
      fieldGroup: [
        {
          type: 'tab',
          props: {
            label: 'Personal data',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: { label: 'First name' },
            },
          ],
        },
        {
          type: 'tab',
          props: {
            disabled: false,
            label: 'Destination',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'country',
              props: { label: 'Country' },
            },
          ],
        },
      ],
    },
  ],
};

describe('Studio Material profile integration', () => {
  let libraryService: CoreLibraryService;
  let formService: CoreFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideFormlyCore(),
        provideCore(),
        provideCoreConfig([materialFormEditorConfig, studioMaterialFormEditorConfig], false),
        provideLocalFormStore(),
      ],
    });

    libraryService = TestBed.inject(CoreLibraryService);
    formService = TestBed.inject(CoreFormService);
  });

  it('keeps runtime components separate from builder overrides and preserves defaults', () => {
    const runtime = new FormlyConfig();
    for (const option of studioMaterialFormEditorConfig.configOptions ?? []) {
      runtime.addConfig(option);
    }
    expect(runtime.getType('stepper')?.component).toBe(withStepperType().types?.[0].component);
    expect(runtime.getType('tabs')?.component).toBe(withTabsType().types?.[0].component);

    for (const option of studioMaterialFormEditorConfig.builderConfigOptions ?? []) {
      runtime.addConfig(option);
    }
    expect(runtime.getType('stepper')?.component).toBe(
      withStepperTypeBuilder().types?.[0].component,
    );
    expect(runtime.getType('tabs')?.component).toBe(withTabsTypeBuilder().types?.[0].component);
    expect(runtime.getType('stepper')?.defaultOptions).toEqual(
      withStepperType().types?.[0].defaultOptions,
    );
  });

  it('retains transient state through edits and mode changes without exporting it', async () => {
    await firstValueFrom(
      formService.addForm$(
        'Transient tabs state',
        studioMaterialTabsForm.fields,
        studioMaterialTabsForm.model,
        'form-studio-material',
      ),
    );
    const state = TestBed.inject(BuilderFieldStateService);
    const fieldId = formService.activeRootFieldIds()[0];
    const field = formService.activeFieldMap()[fieldId];
    state.setState(field, { selectedIndex: 1 });
    formService.setActiveField(fieldId);
    formService.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'dynamicHeight'],
      value: true,
    });
    expect(state.getState(formService.activeFormFields()[0])).toEqual({ selectedIndex: 1 });

    for (const mode of ['preview', 'json', 'form'] as const) {
      formService.setActiveFormDisplayMode(mode);
      expect(state.getState(formService.activeFormFields()[0])).toEqual({ selectedIndex: 1 });
    }

    const exported = formService.convertToRawForm(formService.activeForm()!);
    expect(exported.model).toEqual(studioMaterialTabsForm.model);
    expect(JSON.stringify(exported)).not.toContain('selectedIndex');
    expect(JSON.stringify(exported)).not.toContain('_info');

    const formId = formService.activeFormId()!;
    formService.setActiveForm(null);
    formService.setActiveForm(formId);
    expect(state.getState(formService.activeFormFields()[0])).toBeUndefined();
  });

  it('discards transient state when a container and its descendants are deleted', async () => {
    await firstValueFrom(
      formService.addForm$(
        'Deleted stepper state',
        studioMaterialStepperForm.fields,
        {},
        'form-studio-material',
      ),
    );
    const state = TestBed.inject(BuilderFieldStateService);
    const fieldId = formService.activeRootFieldIds()[0];
    const field = formService.activeFieldMap()[fieldId];
    const child = formService.activeFieldMap()[field._info.childIds[0]];
    state.setState(field, { selectedIndex: 1 });
    state.setState(child, { expanded: true });

    formService.removeField(fieldId);
    expect(state.getState(field)).toBeUndefined();
    expect(state.getState(child)).toBeUndefined();
    expect(formService.activeFieldMap()).toEqual({});
  });

  it('round-trips Button Group options and scalar values without editor metadata', () => {
    libraryService.setActiveLibrary('form-studio-material');

    const editorForm = formService.convertFromRawForm(studioMaterialForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const serializedForm = JSON.stringify(convertedForm);

    expect(convertedForm.libraryId).toBe('form-studio-material');
    expect(convertedForm.model).toEqual({ density: 'comfortable' });
    expect(convertedForm.fields[0]).toMatchObject(studioMaterialForm.fields[0]);
    expect(serializedForm).not.toContain('_info');
  });

  it('round-trips nested Card fields and wrapper properties', () => {
    libraryService.setActiveLibrary('form-studio-material');

    const editorForm = formService.convertFromRawForm(studioMaterialCardForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const convertedRoot = convertedForm.fields[0] as FormlyFieldConfig;

    expect(convertedForm.fields[0]).toMatchObject(studioMaterialCardForm.fields[0]);
    expect(convertedRoot.props?.['cardSubtitle']).toBe('Personal details');
    expect(convertedRoot.fieldGroup).toHaveLength(1);
    expect(convertedRoot.fieldGroup?.[0]).toMatchObject(
      studioMaterialCardForm.fields[0].fieldGroup[0],
    );
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });

  it('round-trips Postal Code formatting and storage properties', () => {
    libraryService.setActiveLibrary('form-studio-material');

    const editorForm = formService.convertFromRawForm(studioMaterialPostalCodeForm);
    const convertedForm = formService.convertToRawForm(editorForm);

    expect(convertedForm.model).toEqual({ postalCode: 'K1A0B1' });
    expect(convertedForm.fields[0]).toMatchObject(studioMaterialPostalCodeForm.fields[0]);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });

  it('exposes Stepper as a configurable parent in the field catalog', () => {
    const stepperType = studioMaterialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'stepper');

    expect(stepperType).toMatchObject({
      displayName: 'Stepper',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(stepperType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.linear',
      'props.orientation',
      'props.ariaLabel',
      'hide',
      'expressions',
    ]);
  });

  it('exposes Step as a configurable parent in the field catalog', () => {
    const stepType = studioMaterialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'step');

    expect(stepType).toMatchObject({
      displayName: 'Step',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(stepType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.label',
      'props.optional',
      'props.disableEdit',
      'props.previousButtonLabel',
      'props.nextButtonLabel',
      'hide',
      'expressions',
    ]);
  });

  it('exposes Tabs as a configurable parent in the field catalog', () => {
    const tabsType = studioMaterialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'tabs');

    expect(tabsType).toMatchObject({
      displayName: 'Tabs',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(tabsType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.dynamicHeight',
      'props.headerPosition',
      'props.alignTabs',
      'props.disableStretchTabs',
      'props.fitInkBarToContent',
      'props.preserveContent',
      'hide',
      'expressions',
    ]);
  });

  it('exposes Tab as a configurable parent in the field catalog', () => {
    const tabType = studioMaterialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'tab');

    expect(tabType).toMatchObject({
      displayName: 'Tab',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(tabType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.label',
      'props.disabled',
      'hide',
      'expressions',
    ]);
  });

  it('accepts and round-trips Stepper fields with explicit Step children', () => {
    libraryService.setActiveLibrary('form-studio-material');

    expect(
      studioMaterialFormEditorConfig.schema.safeParse(studioMaterialStepperForm.fields).success,
    ).toBe(true);

    const editorForm = formService.convertFromRawForm(studioMaterialStepperForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const convertedRoot = convertedForm.fields[0] as FormlyFieldConfig;

    expect(convertedForm.fields[0]).toMatchObject(studioMaterialStepperForm.fields[0]);
    expect(convertedRoot.fieldGroup).toHaveLength(2);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });

  it('accepts and round-trips Tabs fields with explicit Tab children', () => {
    libraryService.setActiveLibrary('form-studio-material');

    expect(
      studioMaterialFormEditorConfig.schema.safeParse(studioMaterialTabsForm.fields).success,
    ).toBe(true);

    const editorForm = formService.convertFromRawForm(studioMaterialTabsForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const convertedRoot = convertedForm.fields[0] as FormlyFieldConfig;

    expect(convertedForm.fields[0]).toMatchObject(studioMaterialTabsForm.fields[0]);
    expect(convertedRoot.fieldGroup).toHaveLength(2);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });
});
