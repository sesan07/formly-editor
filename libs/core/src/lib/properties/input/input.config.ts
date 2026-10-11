import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface InputPropertyConfig extends BasePropertyConfig {
  type: PropertyType.INPUT;
  /**
   * HTML Input data type which controls the control's keyboard and
   * formatting behavior (e.g. 'number' restricts to numeric input).
   */
  dataType: 'text' | 'number' | 'password' | 'email' | 'tel' | 'url';
  /**
   * Placeholder text shown inside the input when the value is empty.
   */
  placeholder?: string;
  /**
   * When true (default), an empty value clears the property from the target
   * instead of writing the empty value. Set to false to persist empty values.
   * @default true
   */
  clearOnEmpty?: boolean;
}

export const createInputProperty: PropertyCreator<InputPropertyConfig, InputPropertyConfig> = (
  v,
) => ({
  ...v,
  type: PropertyType.INPUT,
});
