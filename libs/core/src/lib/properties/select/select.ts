import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { FieldPropertyWrapper } from '../property-wrapper';
import { SelectPropertyConfig, SelectPropertyOption } from './select.config';

@Component({
  selector: 'core-field-select-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Select, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="selectId"
      [isClearable]="isClearable()"
      (clear)="onClear()"
    >
      <p-select
        class="field-property-control"
        optionLabel="label"
        optionValue="value"
        [id]="selectId"
        [placeholder]="property().placeholder || 'Select Option'"
        [checkmark]="true"
        [options]="property().options"
        [ngModel]="controlValue()"
        (ngModelChange)="onValueChange($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldSelectProperty extends BaseProperty<
  SelectPropertyConfig,
  string | number | null
> {
  readonly isClearable = input(true, { transform: booleanAttribute });

  selectId = `select-property-select-${Math.random().toString(36).substring(2, 15)}`;

  protected defaultValue = null;
  protected propertyType = PropertyType.SELECT;

  readonly controlValue = computed(() => this.currentValue());

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string | number | null): void {
    if (value === null && this.property().clearOnEmpty !== false) {
      this._clear();
    } else {
      this._modifyValue(value);
    }
  }

  protected override _isValidProperty(x: unknown): x is SelectPropertyConfig {
    return (
      this._isBaseProperty(x) &&
      'options' in x &&
      Array.isArray(x.options) &&
      x.options.every(isValidOption)
    );
  }
}

function isValidOption(x: unknown): x is SelectPropertyOption {
  return (
    typeof x === 'object' &&
    x !== null &&
    'label' in x &&
    'value' in x &&
    ['string', 'number'].includes(typeof x.value)
  );
}
