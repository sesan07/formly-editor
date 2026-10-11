import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Panel, PanelPassThrough } from 'primeng/panel';

import { Empty } from '../../empty/empty';
import { ArrayTableDialogService } from './array-table-dialog.service';
import { Tooltip } from '../../shared/tooltip';
import { ArrayProperty } from './array.directive';
import { PropertyType } from '../types';
import { getChildPath, trackByPropertyKey } from '../utils';
import { FieldBooleanProperty } from '../boolean/boolean';
import { FieldInputProperty } from '../input/input';
import { FieldObjectProperty } from '../object/object';
import { FieldSelectProperty } from '../select/select';
import { isTableDialogProperty, isTableRow } from './table-dialog.utils';

@Component({
  selector: 'core-field-array-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldSelectProperty,
    FieldBooleanProperty,
    FieldInputProperty,
    FieldObjectProperty,
    ButtonDirective,
    ButtonIcon,
    Panel,
    Empty,
    Tooltip,
  ],
  template: `
    <p-panel
      toggler="header"
      [pt]="panelPT()"
      [toggleable]="combinedIsCollpasible()"
      [collapsed]="combinedIsCollpasible() ? isCollapsed() : false"
      (collapsedChange)="isCollapsed.set(!!$event)"
    >
      <ng-template #header>
        <span
          class="p-panel-title"
          tooltipPosition="left"
          [coreTooltip]="property().description"
        >
          {{ property().label }}
          {{ '[' + childProperties().length + ']' }}
        </span>
      </ng-template>
      <ng-template #icons>
        <button
          class="mr-2"
          pButton
          text
          rounded
          aria-label="Add item"
          coreTooltip="Add item"
          tooltipPosition="top"
          [style.opacity]="isCollapsed() ? '0' : '1'"
          [style.pointerEvents]="isCollapsed() ? 'none' : 'auto'"
          (click)="$event.stopPropagation(); onAddChild()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            >add</i
          >
        </button>
        @if (canUseTableDialog()) {
          <button
            pButton
            text
            rounded
            aria-label="Edit items as table"
            coreTooltip="Edit items as table"
            tooltipPosition="top"
            (click)="$event.stopPropagation(); openTable()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
              >table</i
            >
          </button>
        }
      </ng-template>

      @if (combinedIsCollpasible()) {
        <ng-template #headericons>
          <i class="material-symbols-outlined">{{
            isCollapsed() ? 'expand_more' : 'expand_less'
          }}</i>
        </ng-template>
      }
      <div class="field-property-grid">
        @for (child of childProperties(); track trackByPropertyKey($index, child)) {
          <div
            [class.col-span-1]="child.colSpan === 1"
            [class.col-span-2]="child.colSpan !== 1"
          >
            @switch (child.type) {
              @case (typeofProperty.BOOLEAN) {
                <core-field-boolean-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (remove)="onRemoveChild($index)"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (typeofProperty.INPUT) {
                <core-field-input-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (remove)="onRemoveChild($index)"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (typeofProperty.SELECT) {
                <core-field-select-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (remove)="onRemoveChild($index)"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (typeofProperty.OBJECT) {
                <core-field-object-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (remove)="onRemoveChild($index)"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
            }
          </div>
        } @empty {
          <core-empty
            class="col-span-2"
            label="No items yet"
            description="Click the + button to add an item."
          />
        }
      </div>
    </p-panel>
  `,
})
export class FieldArrayProperty extends ArrayProperty {
  private readonly dialogService = inject(ArrayTableDialogService, { optional: true });

  readonly isCollapsible = input(true, { transform: booleanAttribute });

  readonly isCollapsed = signal(true);
  readonly combinedIsCollpasible = computed(() =>
    typeof this.property().isCollapsible === 'boolean'
      ? this.property().isCollapsible
      : this.isCollapsible(),
  );

  readonly panelPT = computed<PanelPassThrough>(() => ({
    header: {
      class: this.isCollapsible() ? 'cursor-pointer' : '',
    },
  }));

  readonly canUseTableDialog = computed(
    () => isTableDialogProperty(this.property()) && this.currentValue().every(isTableRow),
  );

  openTable(): void {
    const property = this.property();
    const rows = this.currentValue();
    if (!isTableDialogProperty(property) || !rows.every(isTableRow)) {
      return;
    }

    if (!this.dialogService) {
      return;
    }

    this.dialogService.open({
      title: property.label ?? 'Edit items',
      childProperties: property.childProperty.childProperties,
      rows,
      canAdd: property.canAdd !== false,
      canRemove: property.childProperty.isRemovable === true,
      saveCallback: (updatedRows) => this._modifyValue(updatedRows),
    });
  }

  typeofProperty = PropertyType;
  getChildPath = getChildPath;
  trackByPropertyKey = trackByPropertyKey;
}
