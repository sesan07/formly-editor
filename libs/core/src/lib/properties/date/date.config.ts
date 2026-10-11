import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface DatePropertyConfig extends BasePropertyConfig {
  type: PropertyType.DATE;
  /**
   * When true (default), an empty value clears the property from the target
   * instead of being ignored. Set to false to leave the existing value untouched.
   * @default true
   */
  clearOnEmpty?: boolean;
}

export const createDateProperty: PropertyCreator<DatePropertyConfig, DatePropertyConfig> = (v) => ({
  ...v,
  type: PropertyType.DATE,
});
