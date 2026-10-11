import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Panel, PanelPassThrough } from 'primeng/panel';
import { Tooltip } from '../../shared/tooltip';
import { ObjectProperty } from './object.directive';
import { PropertyType } from '../types';
import { getChildPath, trackByPropertyKey } from '../utils';
import { FieldBooleanProperty } from '../boolean/boolean';
import { FieldInputProperty } from '../input/input';
import { FieldSelectProperty } from '../select/select';

@Component({
  selector: 'core-field-object-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldSelectProperty,
    FieldBooleanProperty,
    FieldInputProperty,
    Panel,
    ButtonDirective,
    ButtonIcon,
    Tooltip,
  ],
  host: {
    class: 'flex flex-col gap-1',
  },
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
        </span>
      </ng-template>
      @if (combinedIsCollpasible()) {
        <ng-template #headericons>
          <i class="material-symbols-outlined">{{
            isCollapsed() ? 'expand_more' : 'expand_less'
          }}</i>
        </ng-template>
      }
      @if (property().isRemovable) {
        <ng-template #icons>
          <button
            pButton
            text
            rounded
            severity="danger"
            aria-label="Remove"
            coreTooltip="Remove"
            tooltipPosition="top"
            (click)="remove.emit()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
              >remove</i
            >
          </button>
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
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (typeofProperty.INPUT) {
                <core-field-input-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (typeofProperty.SELECT) {
                <core-field-select-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
            }
          </div>
        }
      </div>
    </p-panel>
  `,
})
export class FieldObjectProperty extends ObjectProperty {
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

  typeofProperty = PropertyType;
  getChildPath = getChildPath;
  trackByPropertyKey = trackByPropertyKey;
}
