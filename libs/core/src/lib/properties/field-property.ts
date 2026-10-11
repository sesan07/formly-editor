import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FieldArrayProperty } from './array/array';
import { FieldBooleanProperty } from './boolean/boolean';
import { FieldChipsProperty } from './chips/chips';
import { FieldCustomValidationProperty } from './custom-validation/custom-validation';
import { FieldDateProperty } from './date/date';
import { FieldExpressionsProperty } from './expressions/expressions';
import { FieldGroupProperty } from './group/group';
import { FieldInputProperty } from './input/input';
import { FieldMarkdownProperty } from './markdown/markdown';
import { FieldObjectProperty } from './object/object';
import { FieldSelectProperty } from './select/select';
import { FieldValidationMessagesProperty } from './validation-messages/validation-messages';
import { FieldWrappersProperty } from './wrappers/wrappers';
import { PropertyChange, PropertyConfig, PropertyType } from './types';

@Component({
  selector: 'core-field-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldArrayProperty,
    FieldBooleanProperty,
    FieldChipsProperty,
    FieldCustomValidationProperty,
    FieldDateProperty,
    FieldExpressionsProperty,
    FieldGroupProperty,
    FieldInputProperty,
    FieldMarkdownProperty,
    FieldObjectProperty,
    FieldSelectProperty,
    FieldValidationMessagesProperty,
    FieldWrappersProperty,
  ],
  template: `
    @switch (property().type) {
      @case (propertyType.BOOLEAN) {
        <core-field-boolean-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.INPUT) {
        <core-field-input-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.MARKDOWN) {
        <core-field-markdown-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.DATE) {
        <core-field-date-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.SELECT) {
        <core-field-select-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.CHIPS) {
        <core-field-chips-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.WRAPPERS) {
        <core-field-wrappers-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.OBJECT) {
        <core-field-object-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.GROUP) {
        <core-field-group-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.ARRAY) {
        <core-field-array-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.EXPRESSIONS) {
        <core-field-expressions-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.CUSTOM_VALIDATION) {
        <core-field-custom-validation-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @case (propertyType.VALIDATION_MESSAGES) {
        <core-field-validation-messages-property
          [property]="property()"
          [path]="path()"
          [target]="target()"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
    }
  `,
})
export class FieldProperty {
  readonly property = input.required<PropertyConfig>();
  readonly path = input.required<string[]>();
  readonly target = input.required<Record<string, unknown>>();
  readonly targetChanged = output<PropertyChange>();

  protected readonly propertyType = PropertyType;
}
