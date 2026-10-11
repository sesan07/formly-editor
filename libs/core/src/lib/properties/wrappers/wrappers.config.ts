import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface WrappersPropertyOption {
  /** Human readable wrapper label shown in the selector. */
  label: string;
  /** Wrapper name stored in the field configuration. */
  value: string;
}

export interface WrappersPropertyConfig extends BasePropertyConfig {
  type: PropertyType.WRAPPERS;
  /** Wrapper options available to the selected field type. */
  options: WrappersPropertyOption[];
  /** Placeholder text shown when no wrapper is selected. */
  placeholder?: string;
  /** When true (default), an empty value clears the property from the target instead of writing the empty value. */
  clearOnEmpty?: boolean;
}

export const createWrappersProperty: PropertyCreator<
  WrappersPropertyConfig,
  WrappersPropertyConfig
> = (value) => ({
  ...value,
  type: PropertyType.WRAPPERS,
});
