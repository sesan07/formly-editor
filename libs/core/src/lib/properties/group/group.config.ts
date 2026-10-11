import type { BooleanPropertyConfig } from '../boolean/boolean.config';
import type { InputPropertyConfig } from '../input/input.config';
import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';
import type { SelectPropertyConfig } from '../select/select.config';

export type GroupChildPropertyConfig =
  BooleanPropertyConfig | InputPropertyConfig | SelectPropertyConfig;

export interface GroupPropertyConfig extends BasePropertyConfig {
  type: PropertyType.GROUP;
  /** Properties rendered inside the group panel. */
  childProperties: GroupChildPropertyConfig[];
}

export const createGroupProperty: PropertyCreator<GroupPropertyConfig, GroupPropertyConfig> = (
  value,
) => ({
  ...value,
  type: PropertyType.GROUP,
});
