import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Panel } from 'primeng/panel';
import { Tooltip } from '../../shared/tooltip';
import { PropertyChange, PropertyConfig, PropertyType } from '../types';
import { getChildPath, trackByPropertyKey } from '../utils';
import { FieldBooleanProperty } from '../boolean/boolean';
import { GroupPropertyConfig } from './group.config';
import { FieldInputProperty } from '../input/input';
import { FieldSelectProperty } from '../select/select';

@Component({
  selector: 'core-field-group-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldBooleanProperty, FieldInputProperty, FieldSelectProperty, Panel, Tooltip],
  host: {
    class: 'flex flex-col gap-1',
  },
  template: `
    <p-panel [toggleable]="false">
      <ng-template #header>
        <span
          class="p-panel-title"
          tooltipPosition="left"
          [coreTooltip]="property().description"
        >
          {{ property().label }}
        </span>
      </ng-template>

      <div class="field-property-grid">
        @for (child of property().childProperties; track trackByPropertyKey($index, child)) {
          <div
            [class.col-span-1]="child.colSpan === 1"
            [class.col-span-2]="child.colSpan !== 1"
          >
            @switch (child.type) {
              @case (propertyType.BOOLEAN) {
                <core-field-boolean-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (propertyType.INPUT) {
                <core-field-input-property
                  [path]="getChildPath(path(), child.key)"
                  [property]="child"
                  [target]="target()"
                  (targetChanged)="targetChanged.emit($event)"
                />
              }
              @case (propertyType.SELECT) {
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
export class FieldGroupProperty {
  readonly property = input.required<GroupPropertyConfig, PropertyConfig>({
    transform: (property) => {
      if (property.type !== PropertyType.GROUP) {
        throw new Error('Invalid property config for FieldGroupProperty');
      }
      return property as GroupPropertyConfig;
    },
  });
  readonly path = input.required<string[]>();
  readonly target = input.required<Record<string, unknown>>();
  readonly targetChanged = output<PropertyChange>();

  protected readonly propertyType = PropertyType;
  readonly getChildPath = getChildPath;
  readonly trackByPropertyKey = trackByPropertyKey;
}
