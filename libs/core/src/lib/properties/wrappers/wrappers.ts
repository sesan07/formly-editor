import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { FieldPropertyWrapper } from '../property-wrapper';
import { WrappersPropertyConfig, WrappersPropertyOption } from './wrappers.config';

@Component({
  selector: 'core-field-wrappers-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MultiSelect, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="isClearable()"
      (clear)="onClear()"
    >
      <p-multiselect
        class="field-property-control"
        optionLabel="label"
        optionValue="value"
        display="chip"
        [inputId]="inputId"
        [options]="property().options"
        [placeholder]="property().placeholder || 'Select Wrappers'"
        [filter]="true"
        [ngModel]="orderedValue()"
        (ngModelChange)="onValueChange($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldWrappersProperty extends BaseProperty<WrappersPropertyConfig, string[] | null> {
  readonly isClearable = input(true, { transform: booleanAttribute });
  readonly orderedValue = computed(() =>
    orderValues(this.currentValue() ?? [], this.property().options),
  );

  readonly inputId = `wrappers-property-select-${Math.random().toString(36).substring(2, 15)}`;

  protected defaultValue = null;
  protected propertyType = PropertyType.WRAPPERS;

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string[] | null): void {
    if ((!value || value.length === 0) && this.property().clearOnEmpty !== false) {
      this._clear();
    } else {
      this._modifyValue(orderValues(value ?? [], this.property().options));
    }
  }

  protected override _isValidProperty(x: unknown): x is WrappersPropertyConfig {
    return (
      this._isBaseProperty(x) &&
      'options' in x &&
      Array.isArray(x.options) &&
      x.options.every(isValidOption)
    );
  }
}

function orderValues(selectedValues: string[], options: WrappersPropertyOption[]): string[] {
  const optionOrder = new Map(options.map(({ value: optionValue }, index) => [optionValue, index]));

  return selectedValues
    .map((selectedValue, index) => ({ selectedValue, index }))
    .sort((a, b) => {
      const aOrder = optionOrder.get(a.selectedValue) ?? options.length + a.index;
      const bOrder = optionOrder.get(b.selectedValue) ?? options.length + b.index;
      return aOrder - bOrder;
    })
    .map(({ selectedValue }) => selectedValue);
}

function isValidOption(x: unknown): x is { label: string; value: string } {
  return (
    typeof x === 'object' &&
    x !== null &&
    'label' in x &&
    typeof x.label === 'string' &&
    'value' in x &&
    typeof x.value === 'string'
  );
}
