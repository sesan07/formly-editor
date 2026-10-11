import { computed, Directive } from '@angular/core';
import { PropertyConfig, PropertyType } from '../types';
import { getDefaultPropertyFromValue, getDefaultPropertyValue } from '../utils';
import { ArrayPropertyConfig } from './array.config';
import { BaseProperty } from '../base.directive';

@Directive()
export class ArrayProperty extends BaseProperty<ArrayPropertyConfig, unknown[]> {
  protected defaultValue = [];
  protected propertyType = PropertyType.ARRAY;

  readonly childProperties = computed(() => this.populateChildren());

  onAddChild(type?: PropertyType, dataType?: 'text' | 'number'): void {
    const childValue: unknown = getDefaultPropertyValue(
      type || this.property().childProperty?.type || PropertyType.INPUT,
      dataType,
    );
    const newValue = [...this.currentValue(), childValue];
    this._modifyValue(newValue);
  }

  onRemoveChild(index: number): void {
    const newValue = this.currentValue().filter((_, i) => i !== index);
    this._modifyValue(newValue);
  }

  protected override _isValidProperty(x: unknown): x is ArrayPropertyConfig {
    return this._isBaseProperty(x);
  }

  protected populateChildren(): PropertyConfig[] {
    return this.currentValue()
      .map((childValue, index) => {
        let childProperty: PropertyConfig | undefined;
        if (this.property().childProperty) {
          childProperty = structuredClone(this.property().childProperty);
        } else {
          childProperty = getDefaultPropertyFromValue(childValue ?? '');
        }

        if (childProperty) {
          childProperty.label = `${childProperty.label ?? 'Item'} ${index + 1}`;
          childProperty.key = index + '';
          childProperty.isKeyEditable = false;
        }

        return childProperty;
      })
      .filter((v) => !!v);
  }
}
