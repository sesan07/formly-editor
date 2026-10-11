import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { ValidationOption } from './validation-messages.config';
import { Tooltip } from '../../shared/tooltip';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-validation-message-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    Panel,
    InputText,
    Select,
    FormsModule,
    Tooltip,
    FieldPropertyWrapper,
  ],
  template: `
    <p-panel [header]="'Message ' + (index() + 1)">
      <ng-template #icons>
        <button
          pButton
          text
          rounded
          severity="danger"
          aria-label="Remove message"
          coreTooltip="Remove message"
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

      <div class="flex flex-col gap-1">
        <core-field-property-wrapper
          label="Validation"
          description="Validator (e.g., required, minLength)"
          [labelForId]="keyInputId"
        >
          <p-select
            class="field-property-control"
            placeholder="Select Validation"
            optionLabel="label"
            optionValue="value"
            [checkmark]="true"
            [options]="validationOptions()"
            [ngModel]="key()"
            (ngModelChange)="keyChange.emit($event)"
          />
        </core-field-property-wrapper>
        <core-field-property-wrapper
          label="Message"
          description="Error message shown when validation fails"
          [labelForId]="valueInputId"
        >
          <input
            class="field-property-control"
            pInputText
            type="text"
            placeholder="e.g., Invalid field!"
            [id]="valueInputId"
            [ngModel]="value()"
            (ngModelChange)="valueChange.emit($event)"
          />
        </core-field-property-wrapper>
      </div>
    </p-panel>
  `,
})
export class ValidationMessageItem {
  readonly index = input.required<number>();
  readonly key = input<string>();
  readonly value = input<string>();
  readonly validationOptions = input.required<ValidationOption[]>();

  keyChange = output<string>();
  valueChange = output<string>();
  remove = output<void>();

  keyInputId = `validation-message-item-key-input-${Math.random().toString(36).substring(2, 15)}`;
  valueInputId = `validation-message-item-value-input-${Math.random().toString(36).substring(2, 15)}`;
}
