import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Menu } from 'primeng/menu';

import { MenuItem } from 'primeng/api';
import { ObjectProperty } from '../../properties/object/object.directive';
import { PropertyType } from '../../properties/types';
import { getChildPath, trackByPropertyKey } from '../../properties/utils';
import { Tooltip } from '../../shared/tooltip';
import { ModelArrayProperty } from './array';
import { ModelBooleanProperty } from './boolean';
import { ModelDateProperty } from './date';
import { ModelInputProperty } from './input';
import { ModelPropertyKey } from './property-key';
import { ModelPropertyWrapper } from './property-wrapper';

@Component({
  selector: 'core-model-object-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModelPropertyKey,
    ButtonDirective,
    ButtonIcon,
    Menu,
    ModelBooleanProperty,
    ModelInputProperty,
    ModelArrayProperty,
    ModelPropertyWrapper,
    Tooltip,
    ModelDateProperty,
  ],
  template: `
    <core-model-property-wrapper
      [level]="level()"
      [isTabRoot]="isTabRoot()"
      [alwaysShowActions]="menu.visible"
    >
      <span class="inline-flex min-w-0 items-center gap-2">
        <button
          pButton
          text
          class="size-8 shrink-0"
          rounded
          aria-label="Toggle children"
          (click)="isCollapsed.set(!isCollapsed())"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            style="font-size: 24px;"
            [class.rotate-90]="!isCollapsed()"
          >
            chevron_right
          </i>
        </button>
        <core-model-property-key
          [property]="property()"
          (keyChange)="onKeyChanged($event)"
        />
        <span>{{ '{ ' + childProperties().length + ' }' }}</span>
      </span>
      <ng-container actions>
        <button
          pButton
          text
          class="size-8"
          rounded
          aria-label="Add item"
          coreTooltip="Add item"
          tooltipPosition="top"
          (click)="menu.toggle($event)"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            add
          </i>
        </button>
        @if (property().isRemovable) {
          <button
            pButton
            text
            class="size-8"
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
            >
              delete
            </i>
          </button>
        }
      </ng-container>
    </core-model-property-wrapper>

    <p-menu
      #menu
      [model]="addMenuItems"
      [popup]="true"
    />

    @if (!isCollapsed()) {
      <ul>
        @for (child of childProperties(); track trackByPropertyKey($index, child)) {
          <li>
            @switch (child.type) {
              @case (typeofProperty.BOOLEAN) {
                <core-model-boolean-property
                  [level]="level() + 1"
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                  (remove)="onRemoveChild($index)"
                />
              }
              @case (typeofProperty.INPUT) {
                <core-model-input-property
                  [level]="level() + 1"
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                  (remove)="onRemoveChild($index)"
                />
              }
              @case (typeofProperty.DATE) {
                <core-model-date-property
                  [level]="level() + 1"
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                  (remove)="onRemoveChild($index)"
                />
              }
              @case (typeofProperty.ARRAY) {
                <core-model-array-property
                  [level]="level() + 1"
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                  (remove)="onRemoveChild($index)"
                />
              }
              @case (typeofProperty.OBJECT) {
                <core-model-object-property
                  [level]="level() + 1"
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                  (remove)="onRemoveChild($index)"
                />
              }
            }
          </li>
        }
      </ul>
    }
  `,
})
export class ModelObjectProperty extends ObjectProperty {
  readonly level = input(0, { transform: numberAttribute });
  readonly isTabRoot = input(false, { transform: booleanAttribute });

  addMenuItems: MenuItem[] = [
    { label: 'Array', command: () => this.onAddChild(PropertyType.ARRAY) },
    { label: 'Boolean', command: () => this.onAddChild(PropertyType.BOOLEAN) },
    { label: 'Date', command: () => this.onAddChild(PropertyType.DATE) },
    { label: 'Object', command: () => this.onAddChild(PropertyType.OBJECT) },
    { label: 'Number', command: () => this.onAddChild(PropertyType.INPUT, 'number') },
    { label: 'Text', command: () => this.onAddChild(PropertyType.INPUT, 'text') },
  ];

  readonly isCollapsed = signal(false);
  readonly isMenuOpen = signal(false);

  typeofProperty = PropertyType;
  getChildPath = getChildPath;
  trackByPropertyKey = trackByPropertyKey;
}
