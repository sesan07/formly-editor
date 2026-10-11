import { Injector, runInInjectionContext } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import z from 'zod';
import { provideCore, provideCoreConfig } from '../provider';
import { CORE_EDITOR_CONFIG, CORE_LIBRARY_CONFIGS, LibraryConfig } from './types';
import { type EditorField, type FieldInfo } from '../model/types';
import { createBooleanProperty, createInputProperty } from '../properties';
import { CoreFieldService } from './core-field.service';
import { CoreLibraryService } from './core-library.service';

describe('CoreFieldService', () => {
  describe('direct service configuration', () => {
    let service: CoreFieldService;

    const mockConfig: LibraryConfig = {
      id: 'test-app',
      label: 'Test App',
      configOptions: [],
      formTemplates: [],
      schema: z.any(),
      fieldCategoryOptions: [
        {
          displayName: 'Inputs',
          children: [
            {
              name: 'plain',
              displayName: 'Plain Field',
              materialSymbol: 'edit_note',
              defaultConfig: { type: 'plain' },
            },
            {
              name: 'input',
              displayName: 'Input Field',
              materialSymbol: 'edit',
              defaultConfig: { type: 'input', className: 'w-full' },
              wrapperOptions: [
                {
                  name: 'outer',
                  label: 'Outer Wrapper',
                  properties: [
                    createInputProperty({
                      label: 'Outer Setting',
                      key: 'props.outerSetting',
                      dataType: 'text',
                    }),
                  ],
                },
                {
                  name: 'inner',
                  label: 'Inner Wrapper',
                  properties: [
                    createInputProperty({
                      label: 'Inner Setting',
                      key: 'props.innerSetting',
                      dataType: 'text',
                    }),
                  ],
                },
              ],
            },
          ],
        },
      ],
      defaultTypeOption: {
        name: 'default',
        displayName: 'Default',
        materialSymbol: 'help',
        defaultConfig: { type: 'unknown' },
        wrapperOptions: [
          {
            name: 'fallback',
            label: 'Fallback Wrapper',
            properties: [
              createInputProperty({
                label: 'Fallback Setting',
                key: 'props.fallbackSetting',
                dataType: 'text',
              }),
            ],
          },
        ],
      },
    };

    beforeEach(() => {
      localStorage.clear();
      const testBed = getTestBed();
      testBed.configureTestingModule({
        providers: [
          {
            provide: CORE_EDITOR_CONFIG,
            useValue: {
              editorType: 'form-editor',
              defaultTypeOption: mockConfig.defaultTypeOption,
            },
          },
          { provide: CORE_LIBRARY_CONFIGS, useValue: [mockConfig] },
          CoreLibraryService,
          CoreFieldService,
        ],
      });

      runInInjectionContext(testBed.inject(Injector), () => {
        service = testBed.inject(CoreFieldService);
      });
      TestBed.flushEffects();
    });

    it('initializes field types and categories', () => {
      TestBed.inject(CoreLibraryService).setActiveLibrary(mockConfig.id);
      expect(service.getTypeOption('input')).toBeDefined();
      expect(service.getDefaultField('input', mockConfig.id)).toEqual({
        type: 'input',
        className: 'w-full',
      });
    });

    it('provides field categories sorted by display name without changing configured order', () => {
      TestBed.inject(CoreLibraryService).setActiveLibrary(mockConfig.id);

      expect(service.activeFieldCategoryOptions()[0].children.map(({ name }) => name)).toEqual([
        'input',
        'plain',
      ]);
      expect(mockConfig.fieldCategoryOptions[0].children.map(({ name }) => name)).toEqual([
        'plain',
        'input',
      ]);
    });

    it('falls back to defaultTypeOption when unknown type is requested', () => {
      expect(service.getDefaultField('non-existent', mockConfig.id)).toEqual({ type: 'unknown' });
    });

    it('resolves wrapper properties in the order persisted on the field', () => {
      TestBed.inject(CoreLibraryService).setActiveLibrary(mockConfig.id);

      const properties = service.getProperties({
        type: 'input',
        wrappers: ['inner', 'missing', 'outer'],
      });

      expect(properties.map(({ key }) => key)).toEqual([
        'wrappers',
        'wrapper-inner',
        'wrapper-outer',
      ]);
      expect(properties[0]).toMatchObject({
        label: 'Wrappers',
        options: [
          { label: 'Outer Wrapper', value: 'outer' },
          { label: 'Inner Wrapper', value: 'inner' },
        ],
      });
      expect(properties[1]).toMatchObject({
        type: 'Group',
        label: 'Inner Wrapper Wrapper Options',
        childProperties: [{ key: 'props.innerSetting' }],
      });
      expect(properties[2]).toMatchObject({
        type: 'Group',
        label: 'Outer Wrapper Wrapper Options',
        childProperties: [{ key: 'props.outerSetting' }],
      });
    });

    it('uses default wrapper options for unknown field types without rewriting persisted wrappers', () => {
      TestBed.inject(CoreLibraryService).setActiveLibrary(mockConfig.id);

      const properties = service.getProperties({
        type: 'unknown',
        wrappers: ['persisted', 'fallback'],
      });

      expect(properties.map(({ key }) => key)).toEqual(['wrappers', 'wrapper-fallback']);
      expect(properties[1]).toMatchObject({
        type: 'Group',
        label: 'Fallback Wrapper Wrapper Options',
        childProperties: [{ key: 'props.fallbackSetting' }],
      });
    });

    it('hides the wrappers property when a field type has no wrapper options', () => {
      TestBed.inject(CoreLibraryService).setActiveLibrary(mockConfig.id);

      const properties = service.getProperties({
        type: 'plain',
        wrappers: ['persisted'],
      });

      expect(properties.map(({ key }) => key)).toEqual([]);
    });

    it('compares fields for equality based on type and wrappers', () => {
      const fieldA = {
        _info: { id: '1', name: 'a', formId: 'f', idPath: ['1'], childIds: [] },
        type: 'input',
        wrappers: ['panel'],
      };
      const fieldB = {
        _info: { id: '2', name: 'b', formId: 'f', idPath: ['2'], childIds: [] },
        type: 'input',
        wrappers: ['panel'],
      };
      const fieldC = {
        _info: { id: '3', name: 'c', formId: 'f', idPath: ['3'], childIds: [] },
        type: 'input',
        wrappers: [],
      };

      expect(service.isFieldEqual(fieldA, fieldB)).toBe(true);
      expect(service.isFieldEqual(fieldA, fieldC)).toBe(false);
    });

    it('saves and loads custom presets', () => {
      TestBed.inject(CoreLibraryService).setActiveLibrary(mockConfig.id);
      service.savePreset('Zebra Preset', { type: 'input', className: 'custom-class' });
      service.savePreset('Alpha Preset', { type: 'plain' });

      const presets = service.fieldCategoryPresets();
      const inputCategory = presets.find((c) => c.displayName === 'Inputs');
      expect(inputCategory?.children.map((p) => p.displayName)).toEqual([
        'Alpha Preset',
        'Zebra Preset',
      ]);
    });

    it('updates field options when the active config changes', () => {
      const alternateConfig: LibraryConfig = {
        ...mockConfig,
        id: 'alternate-app',
        label: 'Alternate App',
        fieldCategoryOptions: [
          {
            displayName: 'Controls',
            children: [
              {
                name: 'toggle',
                displayName: 'Toggle Field',
                materialSymbol: 'toggle_on',
                defaultConfig: { type: 'toggle' },
              },
            ],
          },
        ],
      };
      const testBed = getTestBed();
      testBed.resetTestingModule();
      testBed.configureTestingModule({
        providers: [
          {
            provide: CORE_EDITOR_CONFIG,
            useValue: {
              editorType: 'form-editor',
              defaultTypeOption: mockConfig.defaultTypeOption,
            },
          },
          { provide: CORE_LIBRARY_CONFIGS, useValue: [mockConfig, alternateConfig] },
          CoreLibraryService,
          CoreFieldService,
        ],
      });

      const alternateService = testBed.inject(CoreFieldService);
      testBed.inject(CoreLibraryService).setActiveLibrary(alternateConfig.id);
      TestBed.flushEffects();

      expect(alternateService.getTypeOption('toggle')).toBeDefined();
      expect(alternateService.getTypeOption('input')).toBeUndefined();
      expect(alternateService.fieldCategoryPresets()[0].displayName).toBe('Controls');
    });
  });

  const libraryConfig: LibraryConfig = {
    id: 'form-editor-test',
    fieldCategoryOptions: [
      {
        displayName: 'Basic',
        children: [
          {
            displayName: 'Input',
            name: 'input',
            materialSymbol: 'text_fields',
            defaultConfig: { type: 'input' },
            properties: [
              createInputProperty({ label: 'Label', key: 'props.label', dataType: 'text' }),
            ],
            validationConfig: {
              rules: [
                {
                  name: 'required',
                  property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
                },
              ],
            },
          },
        ],
      },
    ],
    defaultTypeOption: {
      name: 'default',
      displayName: 'Default',
      materialSymbol: 'help',
      defaultConfig: { type: 'input' },
      validationConfig: {
        rules: [
          {
            name: 'required',
            property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
          },
        ],
      },
    },
    formTemplates: [],
    label: 'Test UI',
    configOptions: [],
    schema: z.any(),
  };

  describe('provider configuration', () => {
    let service: CoreFieldService;

    beforeEach(() => {
      const testBed = getTestBed();
      testBed.configureTestingModule({
        providers: [provideCore(), provideCoreConfig([libraryConfig], false)],
      });

      service = testBed.inject(CoreFieldService);
      testBed.inject(CoreLibraryService).setActiveLibrary(libraryConfig.id);
    });

    it('exposes configured field type options', () => {
      expect(service.activeFieldTypeOptions()).toHaveLength(1);
      expect(service.getDefaultField('input', libraryConfig.id)).toEqual({ type: 'input' });
    });

    it('reads field keys and key paths from editor field data', () => {
      const fieldMap: Record<string, EditorField> = {
        root: {
          _info: {
            id: 'root',
            name: 'Root',
            formId: 'form-1',
            idPath: ['root'],
            childIds: ['child'],
          },
          key: 'rootKey',
        } as EditorField,
        child: {
          _info: {
            id: 'child',
            name: 'Child',
            formId: 'form-1',
            idPath: ['root', 'child'],
            childIds: [],
          },
          key: 'childKey',
        } as EditorField,
      };

      const fieldInfo: FieldInfo = fieldMap['child']._info;

      expect(service.getKey(fieldMap['child'])).toBe('childKey');
      expect(service.getKeyPath(fieldInfo, fieldMap)).toBe('rootKey.childKey');
      expect(service.getChildIds(fieldInfo)).toEqual([]);
    });

    it('returns an empty key string when key is missing', () => {
      expect(service.getKey({ _info: {} as FieldInfo } as EditorField)).toBe('');
    });

    it('resolves validation configuration separately from general properties', () => {
      const field = { type: 'input' } as Parameters<CoreFieldService['getProperties']>[0];

      expect(service.getProperties(field).map(({ key }) => key)).toEqual(['props.label']);
      expect(service.getValidationConfig(field)?.rules).toEqual([
        {
          name: 'required',
          property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
        },
      ]);
    });

    it('returns no validation configuration for unknown field types without editor defaults', () => {
      const field = { type: 'unknown' } as Parameters<CoreFieldService['getValidationConfig']>[0];

      expect(service.getValidationConfig(field)).toBeUndefined();
    });
  });
});
