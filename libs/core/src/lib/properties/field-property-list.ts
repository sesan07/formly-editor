import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FieldProperty } from './field-property';
import { PropertyChange, PropertyConfig, PropertyType } from './types';

@Component({
  selector: 'core-field-property-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldProperty],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 pb-4',
  },
  template: `
    <ul class="grid grid-cols-2 gap-2">
      @for (property of leafProperties(); track property.config.key) {
        <li
          [class.col-span-1]="property.config.colSpan === 1"
          [class.col-span-2]="property.config.colSpan !== 1"
        >
          <core-field-property
            [property]="property.config"
            [path]="property.path"
            [target]="target()"
            (targetChanged)="targetChanged.emit($event)"
          />
        </li>
      }
      @for (property of nestedProperties(); track property.config.key) {
        <li
          [class.col-span-1]="property.config.colSpan === 1"
          [class.col-span-2]="property.config.colSpan !== 1"
        >
          <core-field-property
            [property]="property.config"
            [path]="property.path"
            [target]="target()"
            (targetChanged)="targetChanged.emit($event)"
          />
        </li>
      }
    </ul>
  `,
})
export class FieldPropertyList {
  readonly properties = input.required<PropertyConfig[]>();
  readonly target = input.required<Record<string, unknown>>();
  readonly targetChanged = output<PropertyChange>();

  private readonly leafPropertyTypes = [
    PropertyType.BOOLEAN,
    PropertyType.DATE,
    PropertyType.INPUT,
    PropertyType.SELECT,
    PropertyType.CHIPS,
    PropertyType.WRAPPERS,
  ];

  private readonly resolvedProperties = computed(() =>
    this.properties().map((config) => ({
      config,
      path: config.type === PropertyType.GROUP ? [] : this.getPropertyPath(config.key),
    })),
  );

  protected readonly leafProperties = computed(() =>
    this.resolvedProperties().filter(({ config }) => this.leafPropertyTypes.includes(config.type)),
  );
  protected readonly nestedProperties = computed(() =>
    this.resolvedProperties().filter(({ config }) => !this.leafPropertyTypes.includes(config.type)),
  );

  private getPropertyPath(key: string | number | undefined): string[] {
    if (key === undefined) {
      throw new Error('key is undefined');
    }

    return key.toString().split('.');
  }
}
