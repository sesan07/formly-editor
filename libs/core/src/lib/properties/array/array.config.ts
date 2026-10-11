import { BasePropertyConfig, PropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface ArrayPropertyConfig extends BasePropertyConfig {
  type: PropertyType.ARRAY;
  /**
   * Property for each element contained in the array.
   */
  childProperty?: PropertyConfig;
  /**
   * Whether new items can be added to the array from the UI.
   */
  canAdd?: boolean;
  /**
   * When true, the array panel may be collapsed in the UI.
   */
  isCollapsible?: boolean;
  /**
   * When true, an eligible object array can be edited in the table dialog.
   * Eligibility requires keyed Input, Boolean, or Select child properties.
   */
  useTableDialog?: boolean;
}

export const createArrayProperty: PropertyCreator<ArrayPropertyConfig, ArrayPropertyConfig> = (
  v,
) => ({
  ...v,
  type: PropertyType.ARRAY,
});
