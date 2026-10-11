import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { get } from 'lodash-es';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import type { TableRowReorderEvent } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { ArrayTableDialogService } from './array-table-dialog.service';
import { Tooltip } from '../../shared/tooltip';
import { InputPropertyConfig } from '../input/input.config';
import { PropertyChangeType, PropertyConfig, PropertyType } from '../types';
import { getDefaultPropertyValue, modifyPropertyTarget } from '../utils';
import { SelectPropertyConfig } from '../select/select.config';

interface TableRow {
  id: string;
  value: Record<string, unknown>;
}

interface TableColumn {
  key: string;
  label: string;
  property: PropertyConfig;
}

@Component({
  selector: 'core-field-table-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Dialog,
    InputText,
    Select,
    TableModule,
    ToggleSwitch,
    Tooltip,
  ],
  template: `
    <p-dialog
      modal
      [pt]="dialogPT"
      [header]="data()?.title || 'Edit items'"
      [style]="{
        width: '800px',
        maxWidth: 'calc(100vw - 32px)',
        height: '600px',
        maxHeight: 'calc(100vh - 32px)',
      }"
      [visible]="isOpen()"
      (visibleChange)="updateVisibility($event)"
    >
      <p-table
        scrollHeight="flex"
        [value]="displayRows()"
        [rowTrackBy]="rowTrackBy"
        [scrollable]="true"
        [tableStyle]="{ 'min-width': '42rem' }"
        (onRowReorder)="onRowReorder($event)"
      >
        <ng-template #header>
          <tr>
            <th
              class="w-12"
              aria-label="Reorder"
            ></th>
            @for (column of columns(); track column.key) {
              <th>{{ column.label }}</th>
            }
            <th class="w-32">Actions</th>
          </tr>
        </ng-template>
        <ng-template
          #body
          let-row
          let-rowIndex="rowIndex"
        >
          <tr [pReorderableRow]="rowIndex">
            <td>
              <span
                pReorderableRowHandle
                class="material-symbols-outlined"
                aria-label="Reorder row"
                coreTooltip="Reorder row"
                tooltipPosition="top"
                >drag_indicator</span
              >
            </td>
            @for (column of columns(); track column.key) {
              <td>
                @switch (column.property.type) {
                  @case (propertyType.INPUT) {
                    <input
                      pInputText
                      fluid
                      [type]="column.property.dataType"
                      [ngModel]="getValue(row, column)"
                      (ngModelChange)="updateCell(row, column, $event)"
                    />
                  }
                  @case (propertyType.BOOLEAN) {
                    <p-toggleswitch
                      [ngModel]="getValue(row, column)"
                      (ngModelChange)="updateCell(row, column, $event)"
                    />
                  }
                  @case (propertyType.SELECT) {
                    <p-select
                      fluid
                      optionLabel="label"
                      optionValue="value"
                      [options]="getSelectOptions(column)"
                      [ngModel]="getValue(row, column)"
                      (ngModelChange)="updateCell(row, column, $event)"
                    />
                  }
                }
              </td>
            }
            <td>
              <div class="flex items-center justify-center gap-1">
                @if (data()?.canRemove) {
                  <button
                    pButton
                    text
                    rounded
                    severity="danger"
                    type="button"
                    aria-label="Delete row"
                    coreTooltip="Delete row"
                    tooltipPosition="top"
                    (click)="removeRow(row)"
                  >
                    <i
                      pButtonIcon
                      class="material-symbols-outlined"
                      >delete</i
                    >
                  </button>
                }
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <ng-template #footer>
        <span>
          @if (data()?.canAdd) {
            <button
              pButton
              text
              aria-label="Add item"
              coreTooltip="Add item"
              tooltipPosition="top"
              (click)="addRow()"
            >
              <i
                pButtonIcon
                class="material-symbols-outlined"
                >add</i
              >
              <span pButtonLabel>Add item</span>
            </button>
          }
        </span>
        <button
          pButton
          type="button"
          (click)="save()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            >save</i
          >
          <span pButtonLabel>Save</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class FieldTableDialog {
  private readonly dialogService = inject(ArrayTableDialogService);
  private nextRowId = 0;

  readonly data = this.dialogService.data;
  readonly isOpen = this.dialogService.isOpen;
  readonly workingRows = signal<TableRow[]>([]);
  readonly propertyType = PropertyType;
  readonly rowTrackBy = (_: number, row: TableRow): string => row.id;

  dialogPT: DialogPassThrough = {
    root: {
      style: { overflow: 'hidden' },
    },
    header: {
      style: { height: '5rem' },
    },
    content: {
      style: { height: 'calc(100% - 10rem)' },
    },
    footer: {
      style: { height: '5rem', alignItems: 'center', justifyContent: 'space-between' },
    },
  };

  readonly displayRows = computed(() => [...this.workingRows()]);
  readonly columns = computed<TableColumn[]>(() =>
    (this.data()?.childProperties ?? []).map((property) => ({
      key: property.key as string,
      label: property.label ?? property.key ?? '',
      property,
    })),
  );

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const data = this.data();
      if (!data) {
        return;
      }

      this.nextRowId = 0;
      this.workingRows.set(
        data.rows.map((value) => ({
          id: `table-row-${++this.nextRowId}`,
          value: structuredClone(value),
        })),
      );
    });
  }

  getValue(row: TableRow, column: TableColumn): string | number | boolean | null {
    const cellValue = get(row.value, column.key);
    switch (column.property.type) {
      case PropertyType.INPUT:
        return typeof cellValue === 'string' || typeof cellValue === 'number' ? cellValue : null;
      case PropertyType.BOOLEAN:
        return typeof cellValue === 'boolean' ? cellValue : null;
      case PropertyType.SELECT:
        return typeof cellValue === 'string' || typeof cellValue === 'number' ? cellValue : null;
    }

    return null;
  }

  getSelectOptions(column: TableColumn) {
    return (column.property as SelectPropertyConfig).options;
  }

  updateCell(row: TableRow, column: TableColumn, value: unknown): void {
    const changeType = this.getChangeType(column.property, value);
    const currentRow = this.workingRows().find((current) => current.id === row.id) ?? row;
    const currentValue = currentRow.value;
    const updatedValue =
      changeType === PropertyChangeType.CLEAR
        ? modifyPropertyTarget(currentValue, {
            type: PropertyChangeType.CLEAR,
            path: column.key.split('.'),
          })
        : modifyPropertyTarget(currentValue, {
            type: PropertyChangeType.VALUE,
            path: column.key.split('.'),
            value,
          });

    this.updateRow(row.id, updatedValue);
  }

  onRowReorder(event: TableRowReorderEvent): void {
    const { dragIndex, dropIndex } = event;
    if (dragIndex === undefined || dropIndex === undefined) {
      return;
    }

    this.workingRows.update((rows) => {
      const reorderedRows = [...rows];
      const [row] = reorderedRows.splice(dragIndex, 1);

      if (row) {
        reorderedRows.splice(dropIndex, 0, row);
      }

      return reorderedRows;
    });
  }

  addRow(): void {
    const data = this.data();
    if (!data?.canAdd) {
      return;
    }

    this.workingRows.update((rows) => [
      ...rows,
      {
        id: `table-row-${++this.nextRowId}`,
        value: this.createEmptyRow(),
      },
    ]);
  }

  removeRow(row: TableRow): void {
    if (!this.data()?.canRemove) {
      return;
    }

    this.workingRows.update((rows) => rows.filter((current) => current.id !== row.id));
  }

  save(): void {
    const data = this.data();
    if (!data) {
      return;
    }

    data.saveCallback(this.workingRows().map(({ value }) => structuredClone(value)));
    this.dialogService.close();
  }

  cancel(): void {
    this.dialogService.close();
  }

  updateVisibility(visible: boolean): void {
    if (!visible) {
      this.cancel();
    }
  }

  private updateRow(id: string, value: Record<string, unknown>): void {
    this.workingRows.update((rows) => rows.map((row) => (row.id === id ? { ...row, value } : row)));
  }

  private createEmptyRow(): Record<string, unknown> {
    let value: Record<string, unknown> = {};
    for (const property of this.data()?.childProperties ?? []) {
      if (property.key === undefined) {
        continue;
      }

      const defaultValue = this.getDefaultValue(property);
      value = modifyPropertyTarget(value, {
        type: PropertyChangeType.VALUE,
        path: property.key.split('.'),
        value: defaultValue,
      });
    }
    return value;
  }

  private getDefaultValue(property: PropertyConfig): unknown {
    const inputDataType = (property as InputPropertyConfig).dataType;
    const dataType = inputDataType ? (inputDataType === 'number' ? 'number' : 'text') : undefined;
    return getDefaultPropertyValue(property.type, dataType);
  }

  private getChangeType(property: PropertyConfig, value: unknown): PropertyChangeType {
    const { clearOnEmpty, clearOnFalse } = property as {
      clearOnEmpty?: boolean;
      clearOnFalse?: boolean;
    };
    const shouldClear = (clearOnEmpty || clearOnFalse) && typeof value !== 'number' && !value;
    return shouldClear ? PropertyChangeType.CLEAR : PropertyChangeType.VALUE;
  }
}
