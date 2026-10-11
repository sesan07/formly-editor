import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { DatePicker, DatePickerPassThrough } from 'primeng/datepicker';
import { DateProperty } from '../../properties/date/date.directive';
import { Tooltip } from '../../shared/tooltip';
import { ModelPropertyKey } from './property-key';
import { ModelPropertyWrapper } from './property-wrapper';

@Component({
  selector: 'core-model-date-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModelPropertyKey,
    FormsModule,
    ButtonDirective,
    ButtonIcon,
    ModelPropertyWrapper,
    Tooltip,
    DatePicker,
  ],
  template: `
    <core-model-property-wrapper [level]="level()">
      <span class="inline-flex min-w-0 grow items-center gap-2">
        <span class="invisible size-8 shrink-0"> </span>
        <span class="inline-flex items-center gap-0.5">
          <core-model-property-key
            [property]="property()"
            (keyChange)="onKeyChanged($event)"
          />
          <span>:</span>
        </span>
        <p-datepicker
          class="h-9 min-w-0 grow truncate"
          showIcon
          appendTo="body"
          [pt]="datePickerPT"
          [inputId]="inputId"
          [ngModel]="currentValue()"
          (ngModelChange)="onValueChange($event)"
        />
      </span>
      <ng-container actions>
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
  `,
})
export class ModelDateProperty extends DateProperty {
  readonly level = input(0, { transform: numberAttribute });

  inputId = `input-property-input-${Math.random().toString(36).substring(2, 15)}`;
  inputStyle = { minWidth: '0' };
  datePickerPT: DatePickerPassThrough = {
    pcInputText: {
      root: {
        style: { minWidth: '0' },
      },
    },
    dropdown: {
      style: { flexShrink: '0' },
    },
  };

  readonly stringValue = computed(() => {
    const currValue = this.currentValue();
    if (currValue instanceof Date) {
      if (!isNaN(currValue.getTime())) {
        return currValue.toISOString();
      }
      return null;
    }
    return currValue;
  });
}
