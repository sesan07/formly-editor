import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ArrayTableDialogData, ArrayTableDialogService } from './array-table-dialog.service';
import { PropertyType } from '../types';
import { FieldTableDialog } from './table-dialog';

function createData(saveCallback: (rows: Record<string, unknown>[]) => void): ArrayTableDialogData {
  return {
    title: 'Options',
    childProperties: [
      { type: PropertyType.INPUT, key: 'label', dataType: 'text' },
      { type: PropertyType.BOOLEAN, key: 'disabled' },
    ],
    rows: [{ label: 'One', disabled: true }],
    canAdd: true,
    canRemove: true,
    saveCallback,
  };
}

function cloneForTest<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(cloneForTest) as T;
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, cloneForTest(childValue)]),
    ) as T;
  }

  return value;
}

describe('FieldTableDialog', () => {
  let fixture: ComponentFixture<FieldTableDialog>;
  let component: FieldTableDialog;
  let service: ArrayTableDialogService;

  beforeEach(async () => {
    vi.stubGlobal('structuredClone', cloneForTest);

    await TestBed.configureTestingModule({
      imports: [FieldTableDialog],
      providers: [ArrayTableDialogService, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldTableDialog);
    component = fixture.componentInstance;
    service = TestBed.inject(ArrayTableDialogService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  function openDialog() {
    const saveCallback = vi.fn();
    service.open(createData(saveCallback));
    fixture.detectChanges();
    return { saveCallback, row: component.workingRows()[0] };
  }

  it('keeps rows editable while cancelling discards all changes', () => {
    const { row } = openDialog();
    const columns = component.columns();

    component.updateCell(row, columns[0], 'Changed');
    component.updateCell(row, columns[1], false);
    expect(component.getValue(component.workingRows()[0], columns[0])).toBe('Changed');

    component.cancel();

    expect(service.isOpen()).toBe(false);
  });

  it('adds and removes rows without mutating the source payload', () => {
    const { row } = openDialog();
    const sourceRows = service.data()?.rows;

    component.addRow();
    expect(component.workingRows()).toHaveLength(2);
    expect(component.workingRows()[1].value).toEqual({ label: '', disabled: false });

    component.removeRow(row);

    expect(component.workingRows()).toHaveLength(1);
    expect(sourceRows).toEqual([{ label: 'One', disabled: true }]);
  });

  it('cancels without invoking the save callback', () => {
    const { saveCallback, row } = openDialog();
    component.updateCell(row, component.columns()[0], 'Changed');

    component.cancel();

    expect(saveCallback).not.toHaveBeenCalled();
    expect(service.isOpen()).toBe(false);
  });

  it('saves rows in their reordered order', () => {
    const { saveCallback } = openDialog();
    const columns = component.columns();

    component.addRow();
    const addedRow = component.workingRows()[1];
    component.updateCell(addedRow, columns[0], 'Two');
    component.onRowReorder({ dragIndex: 1, dropIndex: 0 });

    component.save();

    expect(saveCallback).toHaveBeenCalledWith([
      { label: 'Two', disabled: false },
      { label: 'One', disabled: true },
    ]);
  });

  it('saves the complete working array once and closes the dialog', () => {
    const { saveCallback, row } = openDialog();
    component.updateCell(row, component.columns()[0], 'Changed');
    component.updateCell(row, component.columns()[1], false);

    component.save();

    expect(saveCallback).toHaveBeenCalledTimes(1);
    expect(saveCallback).toHaveBeenCalledWith([{ label: 'Changed', disabled: false }]);
    expect(service.isOpen()).toBe(false);
  });
});
