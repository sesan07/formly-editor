import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface BooleanPropertyConfig extends BasePropertyConfig {
  type: PropertyType.BOOLEAN;
  /**
   * When true (default), a false value clears the property from the target
   * instead of writing false. Only true is persisted.
   * @default true
   */
  clearOnFalse?: boolean;
  /**
   * When true (default), a null value clears the property from the target
   * instead of writing null.
   * @default true
   */
  clearOnEmpty?: boolean;
}

export const createBooleanProperty: PropertyCreator<
  BooleanPropertyConfig,
  BooleanPropertyConfig
> = (v) => ({
  ...v,
  type: PropertyType.BOOLEAN,
});
