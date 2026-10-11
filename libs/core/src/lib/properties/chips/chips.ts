import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { ChipsPropertyConfig } from './chips.config';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-chips-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, AutoComplete, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <p-autocomplete
        class="field-property-control"
        multiple
        addOnTab
        typeahead="false"
        [inputId]="inputId"
        [placeholder]="property().placeholder || ''"
        [ngModel]="controlValue()"
        (ngModelChange)="onValueChange($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldChipsProperty extends BaseProperty<ChipsPropertyConfig, string[] | null> {
  inputId = `chips-property-input-${Math.random().toString(36).substring(2, 15)}`;

  protected defaultValue = null;
  protected propertyType = PropertyType.CHIPS;

  readonly controlValue = computed(() => {
    const outputString = this.property().outputString;
    const values =
      (outputString
        ? (this.currentValue() as string | null)?.split(outputString.separator).filter((v) => !!v)
        : (this.currentValue() as string[] | null)) ?? [];
    return values;
  });

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string[] | null): void {
    const outputString = this.property().outputString;
    if (outputString) {
      const strValue = value?.length ? value.join(outputString.separator) : null;
      this._modifyValue(strValue);
    } else {
      this._modifyValue(value);
    }
  }

  protected override _isValidProperty(x: unknown): x is ChipsPropertyConfig {
    return this._isBaseProperty(x);
  }
}
