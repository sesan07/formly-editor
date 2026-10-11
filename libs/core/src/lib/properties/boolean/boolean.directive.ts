import { Directive } from '@angular/core';
import { PropertyType } from '../types';
import { BaseProperty } from '../base.directive';
import { BooleanPropertyConfig } from './boolean.config';

@Directive()
export class BooleanProperty extends BaseProperty<BooleanPropertyConfig, boolean | null> {
  protected defaultValue = null;
  protected propertyType = PropertyType.BOOLEAN;

  onClear(): void {
    this._clear();
  }

  onValueChange(value: boolean | null): void {
    if (value === null && this.property().clearOnEmpty !== false) {
      this._clear();
    } else if (value === false && this.property().clearOnFalse !== false) {
      this._clear();
    } else {
      this._modifyValue(value);
    }
  }

  protected override _isValidProperty(x: unknown): x is BooleanPropertyConfig {
    return this._isBaseProperty(x);
  }
}
