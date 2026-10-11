import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface ChipsPropertyConfig extends BasePropertyConfig {
  type: PropertyType.CHIPS;
  /**
   * Placeholder text displayed in the chips input when empty.
   */
  placeholder?: string;
  /**
   * When configured, chips can be represented as a single string using
   * the provided separator on output.
   */
  outputString?: {
    /**
     * Separator used to join chips when producing a single output string.
     */
    separator: string;
  };
}

export const createChipsProperty: PropertyCreator<ChipsPropertyConfig, ChipsPropertyConfig> = (
  v,
) => ({
  ...v,
  type: PropertyType.CHIPS,
});
