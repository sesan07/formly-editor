import { getTestBed } from '@angular/core/testing';
import { provideCore } from '../provider';
import { PropertyChangeType } from '../properties';
import { CoreFormService } from '../editor/core-form.service';
import { CoreLibraryService } from '../config/core-library.service';

import { describe, expect, it } from 'vitest';
import z from 'zod';

import { provideCoreConfig, provideLocalFormStore } from '../provider';
import type { DefaultForm } from '../model/types';
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
        },
        {
          displayName: 'Group',
          name: 'group',
          materialSymbol: 'group',
          defaultConfig: { type: 'group', fieldGroup: [] },
          isParent: true,
        },
        {
          displayName: 'Section',
          name: 'section',
          materialSymbol: 'view_agenda',
          defaultConfig: { type: 'section', fieldGroup: [] },
          isParent: true,
        },
        {
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
              nested: { defaultValue: true },
            },
          },
        },
        {
          displayName: 'Array',
          name: 'array',
          materialSymbol: 'list',
          defaultConfig: { type: 'array', fieldArray: { type: 'input' } },
          isParent: true,
          isFieldArray: true,
        },
      ],
    },
  ],
  defaultTypeOption: {
    name: 'default',
    displayName: 'Default',
    materialSymbol: 'help',
    defaultConfig: { type: 'input' },
  },
  formTemplates: [],
  label: 'Test UI',
  configOptions: [],
  schema: z.array(
    z.looseObject({
      type: z.enum(['input', 'choice', 'group', 'section', 'array']),
    }),
  ),
};

const exportFixtures: Array<{
  name: string;
  rawForm: DefaultForm;
  expectedFields: DefaultForm['fields'];
}> = [
  {
    name: 'flat fields',
    rawForm: {
      id: 'form-flat',
      libraryId: libraryConfig.id,
      name: 'Flat Form',
      model: { existing: true },
      fields: [
        {
          type: 'input',
          key: 'age',
          props: { label: 'Age' },
          defaultValue: 21,
        },
      ],
    },
    expectedFields: [
      {
        type: 'input',
        key: 'age',
        props: { label: 'Age' },
        defaultValue: 21,
      },
    ],
  },
  {
    name: 'nested groups',
    rawForm: {
      id: 'form-group',
      libraryId: libraryConfig.id,
      name: 'Grouped Form',
      model: { existing: true },
      fields: [
        {
          type: 'group',
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: { label: 'First Name' },
            },
          ],
        },
      ],
    },
    expectedFields: [
      {
        type: 'group',
        fieldGroup: [
          {
            type: 'input',
            key: 'firstName',
            props: { label: 'First Name' },
          },
        ],
      },
    ],
  },
  {
    name: 'untyped groups',
    rawForm: {
      id: 'form-untyped-group',
      libraryId: libraryConfig.id,
      name: 'Untyped Group Form',
      model: {},
      fields: [
        {
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: { label: 'First Name' },
            },
          ],
        },
      ],
    },
    expectedFields: [
      {
        type: 'formly-group',
        fieldGroup: [
          {
            type: 'input',
            key: 'firstName',
            props: { label: 'First Name' },
          },
        ],
      },
    ],
  },
  {
    name: 'field arrays',
    rawForm: {
      id: 'form-array',
      libraryId: libraryConfig.id,
      name: 'Array Form',
      model: { existing: true },
      fields: [
        {
          type: 'array',
          fieldArray: {
            type: 'input',
            key: 'item',
            props: { label: 'Item' },
          },
        },
      ],
    },
    expectedFields: [
      {
        type: 'array',
        fieldArray: {
          type: 'input',
          key: 'item',
          props: { label: 'Item' },
        },
      },
    ],
  },
];

describe('CoreFormService', () => {
  let service: CoreFormService;

  beforeEach(() => {
    localStorage.clear();
    const testBed = getTestBed();
    testBed.configureTestingModule({
      providers: [provideCore(), provideCoreConfig([libraryConfig]), provideLocalFormStore()],
    });

    service = testBed.inject(CoreFormService);
    testBed.inject(CoreLibraryService).setActiveLibrary(libraryConfig.id);
  });

  it.each(exportFixtures)('round-trips the %s export fixture', ({ rawForm, expectedFields }) => {
    const editorForm = service.convertFromRawForm({ ...rawForm, libraryId: libraryConfig.id });
    const convertedBack = service.convertToRawForm(editorForm);

    expect(convertedBack.id).toBe(rawForm.id);
    expect(convertedBack.name).toBe(rawForm.name);
    expect(convertedBack.model).toEqual(rawForm.model);
    expect(convertedBack.fields).toHaveLength(expectedFields.length);

    expectedFields.forEach((expectedField, index) => {
      expect(convertedBack.fields[index]).toMatchObject(expectedField);
    });
  });

  it('keeps editor state round-trips stable for the active form shape', () => {
    const rawForm: DefaultForm = {
      id: 'form-1',
      libraryId: libraryConfig.id,
      name: 'Example Form',
      model: { existing: true },
      fields: [
        {
          type: 'group',
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: { label: 'First Name' },
            },
          ],
        },
        {
          type: 'input',
          key: 'age',
          props: { label: 'Age' },
          defaultValue: 21,
        },
      ],
    };

    const editorForm = service.convertFromRawForm(rawForm);

    expect(editorForm.id).toBe('form-1');
    expect(editorForm.rootFieldIds).toHaveLength(2);

    const groupField = editorForm.fieldMap[editorForm.rootFieldIds[0]];
    expect(groupField._info.isParent).toBe(true);
    expect(groupField._info.childIds).toHaveLength(1);

    const convertedBack = service.convertToRawForm(editorForm);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'group',
      fieldGroup: [
        {
          type: 'input',
          key: 'firstName',
          props: { label: 'First Name' },
        },
      ],
    });
    expect(convertedBack.fields[1]).toMatchObject({
      type: 'input',
      key: 'age',
      defaultValue: 21,
      props: { label: 'Age' },
    });
  });

  it('adds fields with defaults and replaces arrays from explicit presets', () => {
    service.addForm$('Choice Form', [], {}, libraryConfig.id).subscribe();

    service.addField('choice');
    const defaultField = service.getField(service.activeFieldId()!);
    expect(defaultField?.props?.['options']).toEqual([
      { label: 'Default 1', value: 'default1' },
      { label: 'Default 2', value: 'default2' },
    ]);

    service.addField('choice', undefined, undefined, {
      id: 'empty-choice',
      displayName: 'Empty Choice',
      field: { type: 'choice', props: { options: [] } },
    });
    const explicitField = service.getField(service.activeFieldId()!);
    expect(explicitField?.props?.['options']).toEqual([]);
    expect(explicitField?.props?.['nested']).toEqual({ defaultValue: true });
  });

  it('builds categorized replacement options without the current type', () => {
    service
      .addForm$('Replacement Options Form', [{ type: 'input' }], {}, libraryConfig.id)
      .subscribe();

    const fieldId = service.activeRootFieldIds()[0];
    const options = service.getReplaceOptions(service.getField(fieldId)!._info);

    expect(options).toHaveLength(1);
    expect(options[0].label).toBe('Basic');
    expect(options[0].items?.map((item) => item.label)).toEqual([
      'Array',
      'Choice',
      'Group',
      'Section',
    ]);
  });

  it('applies defaults and preserves explicit arrays when importing raw fields', () => {
    const editorForm = service.convertFromRawForm({
      id: 'choice-import',
      libraryId: libraryConfig.id,
      name: 'Choice Import',
      model: {},
      fields: [
        { type: 'choice' },
        { type: 'choice', props: { options: [] } },
        {
          type: 'choice',
          props: {
            options: [{ label: 'Imported', value: 'imported' }],
            nested: { sourceValue: true },
          },
        },
      ],
    });

    expect(editorForm.fieldMap[editorForm.rootFieldIds[0]].props?.['options']).toHaveLength(2);
    expect(editorForm.fieldMap[editorForm.rootFieldIds[1]].props?.['options']).toEqual([]);
    expect(editorForm.fieldMap[editorForm.rootFieldIds[2]].props).toEqual({
      options: [{ label: 'Imported', value: 'imported' }],
      nested: { defaultValue: true, sourceValue: true },
    });
  });

  it('keeps rename, preview, and JSON export in sync', () => {
    service
      .addForm$(
        'Example Form',
        [
          {
            type: 'input',
            key: 'name',
            props: { label: 'Name' },
          },
        ],
        { existing: true },
        libraryConfig.id,
      )
      .subscribe();

    const fieldId = service.activeRootFieldIds()[0];
    expect(service.activePreviewFormFields()).not.toBe(service.activeFormFields());
    expect(service.activePreviewFormFields()[0]).not.toHaveProperty('_info');

    service.setActiveField(fieldId);
    service.setActiveFormName('Renamed Form');
    service.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'label'],
      value: 'Display Name',
    });
    service.modifyActiveModel('{"existing":false}');

    expect(service.activeFormName()).toBe('Renamed Form');
    expect(service.activeModel()).toEqual({ existing: false });
    expect(service.activeFormFieldsJSON()).toContain('"label": "Display Name"');
    expect(service.activeFormFieldsJSON()).not.toContain('_info');
    expect(JSON.parse(service.activeFormFieldsJSON())).toEqual(service.activePreviewFormFields());
  });

  it('clears the active field when the selected field is removed', () => {
    service
      .addForm$(
        'Active Field Form',
        [
          {
            type: 'input',
            key: 'firstName',
            props: { label: 'First Name' },
          },
        ],
        { firstName: 'Ada', untouched: true },
        libraryConfig.id,
      )
      .subscribe();

    const fieldId = service.activeRootFieldIds()[0];
    service.setActiveField(fieldId);

    expect(service.activeFieldId()).toBe(fieldId);

    service.removeField(fieldId);

    expect(service.activeFieldId()).toBeNull();
    expect(service.activeRootFieldIds()).toEqual([]);
    expect(service.activeModel()).toEqual({ untouched: true });
  });

  it('clears the active field when a selected descendant is removed with its parent', () => {
    service
      .addForm$(
        'Parent Delete Form',
        [
          {
            type: 'group',
            fieldGroup: [
              {
                type: 'input',
                key: 'firstName',
                props: { label: 'First Name' },
              },
            ],
          },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    const groupFieldId = service.activeRootFieldIds()[0];
    const childFieldId = service.getField(groupFieldId)?._info.childIds[0];

    if (!childFieldId) {
      throw new Error('Expected nested child field to exist');
    }

    service.setActiveField(childFieldId);
    expect(service.activeFieldId()).toBe(childFieldId);

    service.removeField(groupFieldId);

    expect(service.activeFieldId()).toBeNull();
    expect(service.activeRootFieldIds()).toEqual([]);
  });

  it('replaces a root field in place and preserves only compatible metadata', () => {
    service
      .addForm$(
        'Replacement Form',
        [
          {
            type: 'input',
            key: 'name',
            className: 'old-class',
            fieldGroupClassName: 'old-group-class',
            wrappers: ['old-wrapper'],
            validation: { required: true },
            expressions: { hide: 'model.hidden' },
          },
          { type: 'input', key: 'age' },
        ],
        { name: 'Ada', other: true },
        libraryConfig.id,
      )
      .subscribe();

    const [oldFieldId, siblingId] = service.activeRootFieldIds();
    service.setActiveField(oldFieldId);
    service.replaceField('choice', oldFieldId);

    const replacementId = service.activeFieldId();
    const replacement = replacementId ? service.getField(replacementId) : undefined;

    expect(replacementId).toBeTruthy();
    expect(replacementId).not.toBe(oldFieldId);
    expect(service.activeRootFieldIds()).toEqual([replacementId, siblingId]);
    expect(service.getField(oldFieldId)).toBeUndefined();
    expect(replacement).toMatchObject({
      type: 'choice',
      key: 'name',
      className: 'old-class',
      fieldGroupClassName: 'old-group-class',
    });
    expect(replacement?.wrappers).toBeUndefined();
    expect(replacement?.validation).toBeUndefined();
    expect(replacement?.expressions).toBeUndefined();
    expect(service.activeModel()).toEqual({ other: true });
    expect(service.saveStatus()).toBe('dirty');
  });

  it('transfers compatible descendants and recalculates their paths', () => {
    service
      .addForm$(
        'Nested Replacement Form',
        [
          {
            type: 'group',
            key: 'profile',
            fieldGroup: [{ type: 'input', key: 'name' }],
          },
          { type: 'input', key: 'other' },
        ],
        { profile: { name: 'Ada' }, other: true },
        libraryConfig.id,
      )
      .subscribe();

    const [oldFieldId, siblingId] = service.activeRootFieldIds();
    const childId = service.getField(oldFieldId)?._info.childIds[0];

    if (!childId) {
      throw new Error('Expected nested field to exist');
    }

    service.replaceField('section', oldFieldId);

    const replacementId = service.activeFieldId();
    const replacement = replacementId ? service.getField(replacementId) : undefined;

    expect(replacementId).not.toBe(oldFieldId);
    expect(service.activeRootFieldIds()).toEqual([replacementId, siblingId]);
    expect(replacement?._info.childIds).toEqual([childId]);
    expect(service.getField(childId)?._info.idPath).toEqual([replacementId, childId]);
    expect(service.getField(oldFieldId)).toBeUndefined();
    expect(service.activeModel()).toEqual({ other: true });

    const convertedBack = service.convertToRawForm(service.activeForm()!);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'section',
      key: 'profile',
      fieldGroup: [{ type: 'input', key: 'name' }],
    });
  });

  it('transfers the first child when replacing a group with a field array', () => {
    service
      .addForm$(
        'Group To Array Form',
        [
          {
            type: 'group',
            key: 'profile',
            fieldGroup: [
              { type: 'input', key: 'firstName' },
              { type: 'input', key: 'lastName' },
            ],
          },
        ],
        { profile: { firstName: 'Ada', lastName: 'Lovelace' } },
        libraryConfig.id,
      )
      .subscribe();

    const oldGroupId = service.activeRootFieldIds()[0];
    const oldChildIds = service.getField(oldGroupId)?._info.childIds ?? [];
    const [firstChildId, secondChildId] = oldChildIds;

    if (!firstChildId || !secondChildId) {
      throw new Error('Expected group children to exist');
    }

    service.replaceField('array', oldGroupId);

    const replacementId = service.activeFieldId();
    const replacement = replacementId ? service.getField(replacementId) : undefined;

    expect(replacement?._info.isParent).toBe(true);
    expect(replacement?._info.isFieldArray).toBe(true);
    expect(replacement?._info.childIds).toEqual([firstChildId]);
    expect(service.getField(firstChildId)?._info.idPath).toEqual([replacementId, firstChildId]);
    expect(service.getField(secondChildId)).toBeUndefined();
    expect(service.activeModel()).toEqual({});

    const convertedBack = service.convertToRawForm(service.activeForm()!);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'array',
      key: 'profile',
      fieldArray: { type: 'input', key: 'firstName' },
    });
  });

  it('transfers the field-array child when replacing a field array with a group', () => {
    service
      .addForm$(
        'Array To Group Form',
        [
          {
            type: 'array',
            key: 'items',
            fieldArray: { type: 'input', key: 'item' },
          },
        ],
        { items: ['Ada'] },
        libraryConfig.id,
      )
      .subscribe();

    const oldArrayId = service.activeRootFieldIds()[0];
    const childId = service.getField(oldArrayId)?._info.childIds[0];

    if (!childId) {
      throw new Error('Expected field-array child to exist');
    }

    service.replaceField('group', oldArrayId);

    const replacementId = service.activeFieldId();
    const replacement = replacementId ? service.getField(replacementId) : undefined;

    expect(replacement?._info.isParent).toBe(true);
    expect(replacement?._info.isFieldArray).toBeUndefined();
    expect(replacement?._info.childIds).toEqual([childId]);
    expect(service.getField(childId)?._info.idPath).toEqual([replacementId, childId]);
    expect(service.getField(oldArrayId)).toBeUndefined();
    expect(service.activeModel()).toEqual({});

    const convertedBack = service.convertToRawForm(service.activeForm()!);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'group',
      key: 'items',
      fieldGroup: [{ type: 'input', key: 'item' }],
    });
  });

  it('clears replaced fields across nested repeater instances', () => {
    service
      .addForm$(
        'Nested Repeater Replacement Form',
        [
          {
            type: 'array',
            key: 'orders',
            fieldArray: {
              type: 'array',
              key: 'items',
              fieldArray: { type: 'input', key: 'sku' },
            },
          },
        ],
        {
          orders: [
            {
              status: 'open',
              items: [
                { sku: 'A-1', quantity: 1 },
                { sku: 'A-2', quantity: 2 },
              ],
            },
            {
              status: 'closed',
              items: [{ sku: 'B-1', quantity: 3 }],
            },
          ],
          untouched: true,
        },
        libraryConfig.id,
      )
      .subscribe();

    const outerArrayId = service.activeRootFieldIds()[0];
    const innerArrayId = service.getField(outerArrayId)?._info.childIds[0];
    const skuId = innerArrayId && service.getField(innerArrayId)?._info.childIds[0];

    if (!innerArrayId || !skuId) {
      throw new Error('Expected nested repeater fields to exist');
    }

    service.replaceField('choice', skuId);

    expect(service.activeModel()).toEqual({
      orders: [
        {
          status: 'open',
          items: [{ quantity: 1 }, { quantity: 2 }],
        },
        {
          status: 'closed',
          items: [{ quantity: 3 }],
        },
      ],
      untouched: true,
    });
  });

  it('clears a nested repeater path from every outer array item', () => {
    service
      .addForm$(
        'Nested Repeater Container Replacement Form',
        [
          {
            type: 'array',
            key: 'orders',
            fieldArray: {
              type: 'array',
              key: 'items',
              fieldArray: { type: 'input', key: 'sku' },
            },
          },
        ],
        {
          orders: [
            { status: 'open', items: [{ sku: 'A-1' }] },
            { status: 'closed', items: [{ sku: 'B-1' }] },
          ],
          untouched: true,
        },
        libraryConfig.id,
      )
      .subscribe();

    const outerArrayId = service.activeRootFieldIds()[0];
    const innerArrayId = service.getField(outerArrayId)?._info.childIds[0];

    if (!innerArrayId) {
      throw new Error('Expected nested repeater field to exist');
    }

    service.replaceField('group', innerArrayId);

    expect(service.activeModel()).toEqual({
      orders: [{ status: 'open' }, { status: 'closed' }],
      untouched: true,
    });
  });

  it('clears a field inside a keyed group repeater template', () => {
    service
      .addForm$(
        'Keyed Group Repeater Replacement Form',
        [
          {
            type: 'array',
            key: 'rep_tgq1bo',
            fieldArray: {
              type: 'group',
              key: 'yuo',
              fieldGroup: [{ type: 'choice', key: 'chk' }],
            },
          },
        ],
        {
          rep_tgq1bo: [{ chk: true }],
        },
        libraryConfig.id,
      )
      .subscribe();

    const repeaterId = service.activeRootFieldIds()[0];
    const groupId = service.getField(repeaterId)?._info.childIds[0];
    const fieldId = groupId && service.getField(groupId)?._info.childIds[0];

    if (!fieldId) {
      throw new Error('Expected repeater template field to exist');
    }

    service.replaceField('input', fieldId);

    expect(service.activeModel()).toEqual({
      rep_tgq1bo: [{}],
    });
  });

  it('removes descendants when replacing a container with a leaf', () => {
    service
      .addForm$(
        'Incompatible Replacement Form',
        [{ type: 'group', key: 'profile', fieldGroup: [{ type: 'input', key: 'name' }] }],
        { profile: { name: 'Ada' } },
        libraryConfig.id,
      )
      .subscribe();

    const oldFieldId = service.activeRootFieldIds()[0];
    const childId = service.getField(oldFieldId)?._info.childIds[0];

    if (!childId) {
      throw new Error('Expected nested field to exist');
    }

    service.replaceField('input', oldFieldId);

    const replacementId = service.activeFieldId();
    expect(replacementId).not.toBe(oldFieldId);
    expect(service.getField(replacementId!)?.type).toBe('input');
    expect(service.getField(oldFieldId)).toBeUndefined();
    expect(service.getField(childId)).toBeUndefined();
    expect(service.activeRootFieldIds()).toEqual([replacementId]);
    expect(service.activeModel()).toEqual({});
  });

  it('removes nested children without leaving stale tree references', () => {
    service
      .addForm$(
        'Nested Form',
        [
          {
            type: 'group',
            fieldGroup: [
              {
                type: 'input',
                key: 'firstName',
                props: { label: 'First Name' },
              },
            ],
          },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    const groupFieldId = service.activeRootFieldIds()[0];
    const groupField = service.getField(groupFieldId);
    const childFieldId = groupField?._info.childIds[0];

    expect(groupField?._info.childIds).toHaveLength(1);

    if (!childFieldId) {
      throw new Error('Expected nested child field to exist');
    }

    service.removeField(childFieldId);

    const updatedGroupField = service.getField(groupFieldId);
    expect(updatedGroupField?._info.childIds).toEqual([]);
    expect(service.activeRootFieldIds()).toEqual([groupFieldId]);

    const convertedBack = service.convertToRawForm(service.activeForm()!);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'group',
    });
    expect(convertedBack.fields[0].fieldGroup).toBeUndefined();
  });

  it('moves a nested child between parent groups', () => {
    service
      .addForm$(
        'Moved Child Form',
        [
          {
            type: 'group',
            fieldGroup: [
              {
                type: 'input',
                key: 'firstName',
                props: { label: 'First Name' },
              },
            ],
          },
          {
            type: 'group',
          },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    const [sourceGroupId, targetGroupId] = service.activeRootFieldIds();
    const sourceGroup = service.getField(sourceGroupId);
    const childFieldId = sourceGroup?._info.childIds[0];

    if (!childFieldId) {
      throw new Error('Expected source group child to exist');
    }

    service.moveField(childFieldId, 0, undefined, targetGroupId);

    const updatedSourceGroup = service.getField(sourceGroupId);
    const updatedTargetGroup = service.getField(targetGroupId);
    const movedChild = service.getField(childFieldId);

    expect(updatedSourceGroup?._info.childIds).toEqual([]);
    expect(updatedTargetGroup?._info.childIds).toEqual([childFieldId]);
    expect(movedChild?._info.idPath).toEqual([targetGroupId, childFieldId]);
    expect(service.activeFieldId()).toBe(childFieldId);

    const convertedBack = service.convertToRawForm(service.activeForm()!);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'group',
    });
    expect(convertedBack.fields[1]).toMatchObject({
      type: 'group',
      fieldGroup: [
        {
          type: 'input',
          key: 'firstName',
          props: { label: 'First Name' },
        },
      ],
    });
  });

  it('keeps root reorder selection on the moved field', () => {
    service.addForm$('Root Reorder Form', [], {}, libraryConfig.id).subscribe();
    service.addField('input');
    service.addField('input');

    const [firstFieldId, secondFieldId] = service.activeRootFieldIds();

    expect(service.activeFieldId()).toBe(secondFieldId);

    service.moveField(secondFieldId, 1, 0);

    expect(service.activeRootFieldIds()).toEqual([secondFieldId, firstFieldId]);
    expect(service.activeFieldId()).toBe(secondFieldId);
  });

  it('keeps preview projection aligned for nested and array structures', () => {
    service
      .addForm$(
        'Complex Form',
        [
          {
            type: 'group',
            fieldGroup: [
              {
                type: 'input',
                key: 'firstName',
                props: { label: 'First Name' },
              },
            ],
          },
          {
            type: 'array',
            fieldArray: {
              type: 'input',
              key: 'item',
              props: { label: 'Item' },
            },
          },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    expect(service.activePreviewFormFields()).not.toBe(service.activeFormFields());
    expect(service.activePreviewFormFields()[0]).not.toHaveProperty('_info');

    const convertedBack = service.convertToRawForm(service.activeForm()!);
    expect(convertedBack.fields).toHaveLength(2);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'group',
      fieldGroup: [
        {
          type: 'input',
          key: 'firstName',
          props: { label: 'First Name' },
        },
      ],
    });
    expect(convertedBack.fields[1]).toMatchObject({
      type: 'array',
      fieldArray: {
        type: 'input',
        key: 'item',
        props: { label: 'Item' },
      },
    });
  });

  it('rejects moves into self or descendant targets', () => {
    service
      .addForm$(
        'Invalid Move Form',
        [
          {
            type: 'group',
            fieldGroup: [
              {
                type: 'group',
                fieldGroup: [
                  {
                    type: 'input',
                    key: 'firstName',
                    props: { label: 'First Name' },
                  },
                ],
              },
            ],
          },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    const rootGroupId = service.activeRootFieldIds()[0];
    const childGroupId = service.getField(rootGroupId)?._info.childIds[0];
    const fieldId = childGroupId && service.getField(childGroupId)?._info.childIds[0];

    if (!childGroupId || !fieldId) {
      throw new Error('Expected nested group and leaf child to exist');
    }

    const beforeMove = service.convertToRawForm(service.activeForm()!);

    service.moveField(rootGroupId, 0, 0, childGroupId);
    expect(service.convertToRawForm(service.activeForm()!)).toEqual(beforeMove);

    service.moveField(childGroupId, 0, 0, fieldId);
    expect(service.convertToRawForm(service.activeForm()!)).toEqual(beforeMove);
  });

  it('adds, reorders, and removes fields in the active form', () => {
    service.addForm$('Example Form', [], {}, libraryConfig.id).subscribe();

    service.addField('input');
    service.addField('input');

    const firstFieldId = service.activeRootFieldIds()[0];
    const secondFieldId = service.activeRootFieldIds()[1];

    expect(service.getFieldIndex(firstFieldId)).toBe(0);
    expect(service.getFieldIndex(secondFieldId)).toBe(1);

    service.moveField(secondFieldId, 1, 0);
    expect(service.activeRootFieldIds()).toEqual([secondFieldId, firstFieldId]);

    service.removeField(firstFieldId);
    expect(service.activeRootFieldIds()).toEqual([secondFieldId]);
  });

  it('inserts root and nested fields at the requested indexes', () => {
    service.addForm$('Indexed Form', [], {}, libraryConfig.id).subscribe();
    service.addField('input');
    const firstRootFieldId = service.activeRootFieldIds()[0];
    service.addField('input', undefined, 0);

    expect(service.activeRootFieldIds()).toEqual([service.activeFieldId(), firstRootFieldId]);

    service.addField('group');
    const groupId = service.activeFieldId();
    if (!groupId) {
      throw new Error('Expected group field to exist');
    }

    service.addField('input', groupId);
    service.addField('input', groupId, 0);

    const group = service.getField(groupId);
    expect(group?._info.childIds).toEqual([service.activeFieldId(), group?._info.childIds[1]]);
    expect(group?._info.childIds).toHaveLength(2);
  });

  it('appends after a nested leaf in its current parent', () => {
    service
      .addForm$(
        'Nested Append Form',
        [
          {
            type: 'group',
            fieldGroup: [
              { type: 'input', key: 'first' },
              { type: 'input', key: 'second' },
            ],
          },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    const groupId = service.activeRootFieldIds()[0];
    const group = service.getField(groupId);
    const selectedFieldId = group?._info.childIds[0];

    if (!selectedFieldId) {
      throw new Error('Expected nested field to exist');
    }

    service.setActiveField(selectedFieldId);
    service.addField('input', groupId, service.getFieldIndex(selectedFieldId) + 1);

    expect(service.getField(groupId)?._info.childIds).toEqual([
      selectedFieldId,
      service.activeFieldId(),
      group?._info.childIds[1],
    ]);
    expect(service.getField(service.activeFieldId()!)?._info.idPath).toEqual([
      groupId,
      service.activeFieldId(),
    ]);
  });

  it('appends after a parent at the same root level', () => {
    service
      .addForm$('Parent Append Form', [{ type: 'group' }, { type: 'input' }], {}, libraryConfig.id)
      .subscribe();

    const [groupId, inputId] = service.activeRootFieldIds();
    service.setActiveField(groupId);
    service.addField('input', undefined, service.getFieldIndex(groupId) + 1);

    expect(service.activeRootFieldIds()).toEqual([groupId, service.activeFieldId(), inputId]);
    expect(service.getField(service.activeFieldId()!)?._info.idPath).toEqual([
      service.activeFieldId(),
    ]);
  });

  it('replaces a field-array child without leaving an orphan field', () => {
    service.addForm$('Array Replacement Form', [], {}, libraryConfig.id).subscribe();
    service.addField('array');

    const arrayId = service.activeFieldId();
    if (!arrayId) {
      throw new Error('Expected array field to exist');
    }

    service.addField('input', arrayId);
    const firstChildId = service.activeFieldId();
    service.addField('input', arrayId);
    const secondChildId = service.activeFieldId();

    if (!firstChildId || !secondChildId) {
      throw new Error('Expected field-array children to exist');
    }

    expect(secondChildId).not.toBe(firstChildId);
    expect(service.getField(arrayId)?._info.childIds).toEqual([secondChildId]);
    expect(service.getField(firstChildId)).toBeUndefined();
    expect(service.activeFieldCount()).toBe(2);
  });

  it('reorders fields in both directions within the same parent', () => {
    service.addForm$('Reorder Form', [], {}, libraryConfig.id).subscribe();
    service.addField('input');
    service.addField('input');
    service.addField('input');

    const [firstFieldId, secondFieldId, thirdFieldId] = service.activeRootFieldIds();

    service.moveField(firstFieldId, 0, 2);
    expect(service.activeRootFieldIds()).toEqual([secondFieldId, firstFieldId, thirdFieldId]);

    service.moveField(thirdFieldId, 2, 0);
    expect(service.activeRootFieldIds()).toEqual([thirdFieldId, secondFieldId, firstFieldId]);
  });

  it('updates every descendant path when moving a subtree to root', () => {
    service
      .addForm$(
        'Subtree Move Form',
        [
          {
            type: 'group',
            fieldGroup: [
              {
                type: 'group',
                fieldGroup: [{ type: 'input', key: 'name' }],
              },
            ],
          },
          { type: 'group' },
        ],
        {},
        libraryConfig.id,
      )
      .subscribe();

    const [sourceGroupId, targetGroupId] = service.activeRootFieldIds();
    const nestedGroupId = service.getField(sourceGroupId)?._info.childIds[0];
    const leafId = nestedGroupId && service.getField(nestedGroupId)?._info.childIds[0];

    if (!nestedGroupId || !leafId) {
      throw new Error('Expected nested subtree to exist');
    }

    service.moveField(nestedGroupId, 0, 0, targetGroupId);
    expect(service.getField(nestedGroupId)?._info.idPath).toEqual([targetGroupId, nestedGroupId]);
    expect(service.getField(leafId)?._info.idPath).toEqual([targetGroupId, nestedGroupId, leafId]);

    service.moveField(nestedGroupId, 0, 0);
    expect(service.activeRootFieldIds()).toEqual([nestedGroupId, sourceGroupId, targetGroupId]);
    expect(service.getField(nestedGroupId)?._info.idPath).toEqual([nestedGroupId]);
    expect(service.getField(leafId)?._info.idPath).toEqual([nestedGroupId, leafId]);
  });

  it('exports structural edits without editor metadata or orphaned fields', () => {
    service.addForm$('Export Structural Edits Form', [], {}, libraryConfig.id).subscribe();
    service.addField('group');

    const groupId = service.activeFieldId();
    if (!groupId) {
      throw new Error('Expected group field to exist');
    }

    service.addField('input', groupId);
    const nestedFieldId = service.activeFieldId();
    service.addField('input');
    const rootFieldId = service.activeFieldId();

    if (!nestedFieldId || !rootFieldId) {
      throw new Error('Expected structural fields to exist');
    }

    service.moveField(nestedFieldId, 0, 0);
    service.removeField(rootFieldId);

    const activeForm = service.activeForm();
    if (!activeForm) {
      throw new Error('Expected an active form after structural edits');
    }

    const convertedBack = service.convertToRawForm(activeForm);
    const serializedForm = JSON.stringify(convertedBack);

    expect(convertedBack.fields).toHaveLength(2);
    expect(convertedBack.fields[0]).toMatchObject({
      type: 'input',
    });
    expect(convertedBack.fields[1]).toMatchObject({
      type: 'group',
    });
    expect(convertedBack.fields[1].fieldGroup).toBeUndefined();
    expect(serializedForm).not.toContain('_info');
    expect(serializedForm).not.toContain(rootFieldId);
    expect(service.activeFieldCount()).toBe(2);
  });

  it('builds export schema from configured field types', () => {
    expect(service.activeSchema()?.safeParse([{ type: 'input' }]).success).toBe(true);
    expect(
      service.activeSchema()?.safeParse([{ type: 'group', fieldGroup: [{ type: 'input' }] }])
        .success,
    ).toBe(true);
    expect(service.activeSchema()?.safeParse([{ type: 'unknown' }]).success).toBe(false);
  });

  it('cleans editor-only metadata before export', () => {
    const field = {
      _info: {
        id: 'field-1',
        name: 'Field',
        formId: 'form-1',
        idPath: ['field-1'],
        childIds: [],
        isParent: false,
      },
      wrappers: [],
      templateOptions: {},
      props: {},
      expression: {},
      className: '',
      fieldGroupClassName: '',
    } as Parameters<CoreFormService['cleanField']>[0];

    service.cleanField(field);

    expect(field).not.toHaveProperty('_info');
    expect(field).not.toHaveProperty('wrappers');
    expect(field).not.toHaveProperty('templateOptions');
    expect(field).not.toHaveProperty('props');
    expect(field).not.toHaveProperty('expression');
    expect(field).not.toHaveProperty('className');
    expect(field).not.toHaveProperty('fieldGroupClassName');
  });
});
