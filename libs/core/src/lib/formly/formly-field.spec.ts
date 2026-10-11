import { getTestBed } from '@angular/core/testing';
import { createBooleanProperty, createInputProperty } from '../properties';
import { CoreFieldService } from '../config/core-field.service';
import { CoreLibraryService } from '../config/core-library.service';

import { describe, expect, it } from 'vitest';
import z from 'zod';

import { provideCore, provideCoreConfig } from '../provider';
import type { EditorField, FieldInfo } from '../model/types';
import type { LibraryConfig } from '../config/types';

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

describe('CoreFieldService', () => {
  let service: CoreFieldService;

  beforeEach(() => {
    const testBed = getTestBed();
    testBed.configureTestingModule({
      providers: [provideCore(), provideCoreConfig([libraryConfig])],
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
