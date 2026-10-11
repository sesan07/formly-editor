import { Directive } from '@angular/core';
import { PropertyType } from '../types';
import { BaseProperty } from '../base.directive';
import { DatePropertyConfig } from './date.config';

@Directive()
export class DateProperty extends BaseProperty<DatePropertyConfig, Date | string | null> {
  protected defaultValue = null;
  protected propertyType = PropertyType.DATE;

  onClear(): void {
    this._clear();
  }

  onValueChange(value: Date | string | null): void {
    if (!value) {
      if (this.property().clearOnEmpty !== false) {
        this._clear();
      }
      return;
    }
    this._modifyValue(value);
  }

  protected override _isValidProperty(x: unknown): x is DatePropertyConfig {
    return this._isBaseProperty(x);
  }
}
