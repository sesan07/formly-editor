import { describe, expect, it } from 'vitest';

import { PropertyConfig, PropertyType } from '../types';
import { isTableDialogProperty } from './table-dialog.utils';

const inputProperty = {
  type: PropertyType.INPUT,
  key: 'label',
  dataType: 'text',
};

const objectChildProperty = {
  type: PropertyType.OBJECT,
  childProperties: [inputProperty],
};

function arrayProperty(overrides: Record<string, unknown> = {}): PropertyConfig {
  return {
    type: PropertyType.ARRAY,
    key: 'options',
    useTableDialog: true,
    childProperty: objectChildProperty,
    ...overrides,
  } as PropertyConfig;
}

describe('isTableDialogProperty', () => {
  it('accepts an opted-in object array with supported keyed columns', () => {
    expect(isTableDialogProperty(arrayProperty())).toBe(true);
  });

  it('rejects arrays without the opt-in flag', () => {
    expect(isTableDialogProperty(arrayProperty({ useTableDialog: false }))).toBe(false);
  });

  it('rejects arrays without an object child property', () => {
    expect(
      isTableDialogProperty(
        arrayProperty({ childProperty: { type: PropertyType.INPUT, dataType: 'text' } }),
      ),
    ).toBe(false);
  });

  it('rejects empty, unkeyed, and nested columns', () => {
    expect(
      isTableDialogProperty(
        arrayProperty({ childProperty: { type: PropertyType.OBJECT, childProperties: [] } }),
      ),
    ).toBe(false);
    expect(
      isTableDialogProperty(arrayProperty({ childProperty: { type: PropertyType.OBJECT } })),
    ).toBe(false);
    expect(
      isTableDialogProperty(
        arrayProperty({
          childProperty: {
            type: PropertyType.OBJECT,
            childProperties: [{ type: PropertyType.INPUT, dataType: 'text' }],
          },
        }),
      ),
    ).toBe(false);
    expect(
      isTableDialogProperty(
        arrayProperty({
          childProperty: {
            type: PropertyType.OBJECT,
            childProperties: [{ type: PropertyType.OBJECT, key: 'nested', childProperties: [] }],
          },
        }),
      ),
    ).toBe(false);
  });
});
