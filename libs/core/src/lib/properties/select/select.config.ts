import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface SelectPropertyConfig extends BasePropertyConfig {
  type: PropertyType.SELECT;
  /**
   * Available options shown in the select control.
   */
  options: SelectPropertyOption[];
  /**
   * Placeholder text when no option is selected.
   */
  placeholder?: string;
  /**
   * When true (default), an empty selection clears the property from the target
   * instead of writing null.
   * @default true
   */
  clearOnEmpty?: boolean;
}

export interface SelectPropertyOption {
  /**
   * Human readable label for the option.
   */
  label: string;
  /**
   * Value stored in the model when the option is selected.
   */
  value: string | number;
}

export const createSelectProperty: PropertyCreator<SelectPropertyConfig, SelectPropertyConfig> = (
  v,
) => ({
  ...v,
  type: PropertyType.SELECT,
});
