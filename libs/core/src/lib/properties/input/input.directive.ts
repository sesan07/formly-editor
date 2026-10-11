import { Directive } from '@angular/core';
import { PropertyType } from '../types';
import { BaseProperty } from '../base.directive';
import { InputPropertyConfig } from './input.config';

@Directive()
export class InputProperty extends BaseProperty<InputPropertyConfig, string | number | null> {
  protected defaultValue = null;
  protected propertyType = PropertyType.INPUT;

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string | number | null): void {
    if (this._isEmpty(value) && this.property().clearOnEmpty !== false) {
      this._clear();
    } else {
      this._modifyValue(value);
    }
  }

  private _isEmpty(value: string | number | null): boolean {
    return value === null || value === '';
  }

  protected override _isValidProperty(x: unknown): x is InputPropertyConfig {
    return this._isBaseProperty(x);
  }
}
