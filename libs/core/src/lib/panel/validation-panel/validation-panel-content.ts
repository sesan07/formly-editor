import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { get } from 'lodash-es';
import { Panel, PanelPassThrough } from 'primeng/panel';
import { FieldProperty } from '../../properties/field-property';
import { FieldCustomValidationProperty } from '../../properties/custom-validation/custom-validation';
import { PropertyChange, PropertyChangeType, PropertyConfig } from '../../properties/types';
import { ValidationMessageInput } from '../../properties/validation-messages/validation-message-input';
import type { FieldValidationConfig } from '../../properties/validation-messages/validation.types';

@Component({
  selector: 'core-validation-panel-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldCustomValidationProperty, FieldProperty, ValidationMessageInput, Panel],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4',
  },
  template: `
    @if (config().displayProperties?.length) {
      <p-panel header="Display">
        @for (property of config().displayProperties; track property.key) {
          <core-field-property
            [class.col-span-1]="property.colSpan === 1"
            [class.col-span-2]="property.colSpan !== 1"
            [property]="property"
            [path]="propertyPath(property)"
            [target]="target()"
            (targetChanged)="targetChanged.emit($event)"
          />
        }
      </p-panel>
    }

    @if (config().rules.length) {
      <p-panel header="Rules">
        @for (rule of config().rules; track rule.name) {
          <core-field-property
            [property]="rule.property"
            [path]="propertyPath(rule.property)"
            [target]="target()"
            (targetChanged)="onRuleChanged($event, rule.name)"
          />
          @if (hasPropertyValue(rule.property)) {
            <core-validation-message-input
              [validatorLabel]="rule.property.label"
              [validatorName]="rule.name"
              [target]="target()"
              (targetChanged)="targetChanged.emit($event)"
            />
          }
        }
      </p-panel>
    }

    @if (config().customValidators; as property) {
      <core-field-custom-validation-property
        [property]="property"
        [path]="propertyPath(property)"
        [target]="target()"
        (targetChanged)="targetChanged.emit($event)"
      />
    }

    @if (config().asyncValidators; as property) {
      <core-field-custom-validation-property
        [property]="property"
        [path]="propertyPath(property)"
        [target]="target()"
        (targetChanged)="targetChanged.emit($event)"
      />
    }
  `,
})
export class ValidationPanelContent {
  readonly config = input.required<FieldValidationConfig>();
  readonly target = input.required<Record<string, unknown>>();
  readonly targetChanged = output<PropertyChange>();

  protected fieldService = inject(CoreFieldService);

  panelPT: PanelPassThrough = {
    content: {
      class: 'grid! grid-cols-2 gap-2',
    },
  };

  protected readonly messagesPath = this.fieldService.validationMessagesPath;

  protected propertyPath(property: PropertyConfig): string[] {
    if (property.key === undefined) {
      throw new Error('Validation property must have a key');
    }
    return property.key.split('.');
  }

  protected hasPropertyValue(property: PropertyConfig): boolean {
    return this.hasValue(get(this.target(), this.propertyPath(property)));
  }

  protected onRuleChanged(change: PropertyChange, validatorName: string): void {
    this.targetChanged.emit(change);
    if (change.type === PropertyChangeType.CLEAR) {
      this.targetChanged.emit({
        type: PropertyChangeType.CLEAR,
        path: [...this.messagesPath, validatorName],
      });
    }
  }

  private hasValue(value: unknown): boolean {
    return value !== undefined && value !== null && value !== '';
  }
}
