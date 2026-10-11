import { describe, expect, it, vi } from 'vitest';

import { ArrayTableDialogData, ArrayTableDialogService } from './array-table-dialog.service';
import { PropertyType } from '../types';

function createData(): ArrayTableDialogData {
  return {
    title: 'Options',
    childProperties: [
      { type: PropertyType.INPUT, key: 'label', dataType: 'text' },
      { type: PropertyType.BOOLEAN, key: 'disabled' },
    ],
    rows: [{ label: 'One', disabled: false }],
    canAdd: true,
    canRemove: true,
    saveCallback: vi.fn(),
  };
}

describe('ArrayTableDialogService', () => {
  it('defaults to closed with no data', () => {
    const service = new ArrayTableDialogService();

    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });

  it('opens with a deep-cloned working payload', () => {
    const service = new ArrayTableDialogService();
    const data = createData();

    service.open(data);
    data.rows[0]['label'] = 'Changed outside dialog';
    data.childProperties[0].label = 'Changed outside dialog';

    expect(service.isOpen()).toBe(true);
    expect(service.data()?.rows).toEqual([{ label: 'One', disabled: false }]);
    expect(service.data()?.childProperties[0].label).toBeUndefined();
  });

  it('closes and clears the payload', () => {
    const service = new ArrayTableDialogService();
    service.open(createData());

    service.close();

    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });
});
