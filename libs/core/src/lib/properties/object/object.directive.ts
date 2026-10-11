import { computed, Directive } from '@angular/core';
import { PropertyConfig, PropertyType } from '../types';
import { getDefaultPropertyFromValue, getDefaultPropertyValue } from '../utils';
import { BaseProperty } from '../base.directive';
import { ObjectPropertyConfig } from './object.config';

@Directive()
export class ObjectProperty extends BaseProperty<ObjectPropertyConfig, Record<string, unknown>> {
  protected defaultValue = {};
  protected propertyType = PropertyType.OBJECT;

  readonly childProperties = computed(() => this.populateChildren());

  onAddChild(type: PropertyType, dataType?: 'text' | 'number'): void {
    const childValue: unknown = getDefaultPropertyValue(type, dataType);
    this._modifyValue(childValue, [...this.path(), '']);
  }

  onRemoveChild(index: number): void {
    const childProperty: PropertyConfig = this.childProperties()[index];

    if (childProperty.key !== undefined) {
      this._clear([...this.path(), childProperty.key + '']);
    }
  }

  protected override _isValidProperty(x: unknown): x is ObjectPropertyConfig {
    return this._isBaseProperty(x) && 'childProperties' in x && Array.isArray(x.childProperties);
  }

  protected populateChildren(): PropertyConfig[] {
    if (this.property().populateChildrenFromTarget) {
      return this.populateChildrenFromTarget();
    }
    return this.populateChildrenFromProperty();
  }

  private populateChildrenFromProperty(): PropertyConfig[] {
    return [...this.property().childProperties];
  }

  private populateChildrenFromTarget(): PropertyConfig[] {
    const newChildProperties: PropertyConfig[] = [];
    Object.entries(this.currentValue()).forEach(([key, value]) => {
      const childProperty = getDefaultPropertyFromValue(value, key);
      if (childProperty) {
        newChildProperties.push(childProperty);
      }
    });

    return newChildProperties;
  }
}
