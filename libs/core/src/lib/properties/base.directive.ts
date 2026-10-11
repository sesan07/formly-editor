import { computed, Directive, input, output } from '@angular/core';
import { get } from 'lodash-es';
import {
  BasePropertyConfig,
  PropertyChange,
  PropertyChangeType,
  PropertyConfig,
  PropertyType,
} from './types';

@Directive()
export abstract class BaseProperty<P extends BasePropertyConfig, V> {
  readonly property = input.required<P, PropertyConfig>({
    transform: (p) => this._getValidProperty(p),
  });
  readonly path = input<string[]>([]);
  readonly target = input<Record<string, unknown> | unknown[] | undefined>(undefined);
  remove = output<void>();
  keyChanged = output<string>();
  targetChanged = output<PropertyChange>();

  protected readonly currentValue = computed<V>(() =>
    this.path().length
      ? get(this.target(), this.path(), this.defaultValue)
      : (this.target() ?? this.defaultValue),
  );

  protected abstract defaultValue: V;
  protected abstract propertyType: PropertyType;

  onKeyChanged(newKey: string): void {
    this._modifyKey(this.path(), [...this.path().slice(0, -1), newKey]);
  }

  protected _modifyKey(currPath: string[], newPath: string[]): void {
    const change: PropertyChange = {
      type: PropertyChangeType.KEY,
      path: currPath,
      newPath,
    };
    this.targetChanged.emit(change);
  }

  protected _modifyValue(value: unknown, path: string[] = this.path()): void {
    const change: PropertyChange = {
      type: PropertyChangeType.VALUE,
      path,
      value,
    };
    this.targetChanged.emit(change);
  }

  protected _clear(path: string[] = this.path()): void {
    const change: PropertyChange = {
      type: PropertyChangeType.CLEAR,
      path,
    };
    this.targetChanged.emit(change);
  }

  protected _isBaseProperty(x: unknown): x is BasePropertyConfig {
    return typeof x === 'object' && x !== null && 'type' in x && x.type === this.propertyType;
  }

  protected abstract _isValidProperty(x: unknown): x is P;

  private _getValidProperty(x: PropertyConfig): P {
    if (this._isValidProperty(x)) {
      return x;
    }
    throw new Error(`Invalid property config for ${this.constructor.name}`);
  }
}
