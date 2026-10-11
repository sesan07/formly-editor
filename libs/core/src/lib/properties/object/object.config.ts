import { BasePropertyConfig, PropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface ObjectPropertyConfig extends BasePropertyConfig {
  type: PropertyType.OBJECT;
  /**
   * Child properties contained by this object property.
   */
  childProperties: PropertyConfig[];
  /**
   * Not intended for public configuration.
   * @internal
   */
  populateChildrenFromTarget?: boolean;
  /**
   * When true, the object may be collapsed/expanded in the UI.
   */
  isCollapsible?: boolean;
}

export const createObjectProperty: PropertyCreator<ObjectPropertyConfig, ObjectPropertyConfig> = (
  v,
) => ({
  ...v,
  type: PropertyType.OBJECT,
});
