import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format, parse } from 'date-fns';
import { DatePicker, DatePickerPassThrough } from 'primeng/datepicker';
import { DateProperty } from './date.directive';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-date-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FieldPropertyWrapper, DatePicker],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <p-datepicker
        class="field-property-control"
        inputStyleClass="min-w-0 grow"
        showIcon
        appendTo="body"
        [pt]="datePickerPT"
        [inputId]="inputId"
        [ngModel]="currentDateValue()"
        (ngModelChange)="onDateValueChange($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldDateProperty extends DateProperty {
  inputId = `date-property-input-${Math.random().toString(36).substring(2, 15)}`;
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

  readonly currentDateValue = computed(() => {
    const stringValue = this.currentValue();
    if (stringValue instanceof Date) {
      throw new Error('Field date property value must be a string');
    }

    return stringValue ? parse(stringValue, 'yyyy-MM-dd', new Date()) : null;
  });

  onDateValueChange(value: Date | null) {
    if (!value) {
      return;
    }
    const stringValue = format(value, 'yyyy-MM-dd');
    this.onValueChange(stringValue);
  }
}
