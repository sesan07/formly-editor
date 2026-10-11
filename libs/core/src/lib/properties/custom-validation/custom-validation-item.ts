import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { createObjectProperty, createSelectProperty } from '..';
import { ObjectPropertyConfig } from '../object/object.config';
import { CustomValidationOption } from './custom-validation.config';
import { SelectPropertyConfig } from '../select/select.config';
import { ValidationMessageInput } from '../validation-messages/validation-message-input';
import { PropertyChange } from '../types';
import { Tooltip } from '../../shared/tooltip';
import { FieldObjectProperty } from '../object/object';
import { FieldPropertyWrapper } from '../property-wrapper';
import { FieldSelectProperty } from '../select/select';

@Component({
  selector: 'core-custom-validation-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    Panel,
    FormsModule,
    FieldObjectProperty,
    FieldPropertyWrapper,
    FieldSelectProperty,
    ValidationMessageInput,
    Tooltip,
  ],
  styles: `
    .validation-message-row {
      grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr));
    }
  `,
  template: `
    <p-panel [header]="'Validation ' + (index() + 1)">
      <ng-template #icons>
        <button
          pButton
          text
          rounded
          severity="danger"
          aria-label="Remove validation"
          coreTooltip="Remove validation"
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

      <div class="flex flex-col gap-2">
        <div class="validation-message-row grid gap-2">
          @if (isAvailable()) {
            <core-field-select-property
              [path]="namePath()"
              [property]="nameProperty()"
              [isClearable]="false"
              [target]="target()"
              (targetChanged)="targetChanged.emit($event)"
            />
          } @else {
            <core-field-property-wrapper
              label="Validation"
              description="This validator is not registered by the active library."
            >
              <div
                class="field-property-control flex min-h-10 items-center justify-between gap-2 px-3"
                role="status"
              >
                <span>{{ name() }}</span>
                <span class="text-sm text-surface-500">Unavailable</span>
              </div>
            </core-field-property-wrapper>
          }
          @if (messageTarget(); as currentTarget) {
            <core-validation-message-input
              [validatorName]="name() || ''"
              [target]="currentTarget"
              (targetChanged)="targetChanged.emit($event)"
            />
          }
        </div>
        @if (isAvailable() && optionsProperty(); as property) {
          <core-field-object-property
            [isCollapsible]="false"
            [path]="optionsPath()"
            [property]="property"
            [target]="target()"
            (targetChanged)="targetChanged.emit($event)"
          />
        }
      </div>
    </p-panel>
  `,
})
export class CustomValidationItem {
  readonly index = input.required<number>();
  readonly path = input.required<string[]>();
  readonly target = input<Record<string, unknown> | unknown[] | undefined>(undefined);
  targetChanged = output<PropertyChange>();

  readonly name = input<string>();
  readonly validationOptions = input.required<CustomValidationOption[]>();

  nameChange = output<string>();
  remove = output<void>();

  keyInputId = `validation-message-item-key-input-${Math.random().toString(36).substring(2, 15)}`;
  valueInputId = `validation-message-item-value-input-${Math.random().toString(36).substring(2, 15)}`;

  readonly namePath = computed(() => [...this.path(), 'name']);
  readonly messageTarget = computed(() => {
    const target = this.target();
    return target && !Array.isArray(target) ? target : undefined;
  });
  readonly isAvailable = computed(() =>
    this.validationOptions().some(({ value }) => value === this.name()),
  );
  readonly nameProperty = computed<SelectPropertyConfig>(() =>
    createSelectProperty({
      label: 'Validation',
      key: 'name',
      options: this.validationOptions(),
      description: 'The validator to apply (select from available custom validators).',
    }),
  );

  readonly optionsPath = computed(() => [...this.path(), 'options']);
  readonly optionsProperty = computed<ObjectPropertyConfig | null>(() => {
    const optionProperties = this.validationOptions().find(
      ({ value }) => this.name() === value,
    )?.optionProperties;
    if (optionProperties?.length) {
      return createObjectProperty({
        label: 'Options',
        key: 'options',
        childProperties: optionProperties,
        description: 'Additional configuration options for the selected validator.',
      });
    }
    return null;
  });
}
