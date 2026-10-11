import { BasePropertyConfig, PropertyConfig, PropertyCreator, PropertyType } from '../types';

export type CustomValidationPropertyConfig = BasePropertyConfig & {
  type: PropertyType.CUSTOM_VALIDATION;
  /**
   * Which validation key in the field this property configures.
   */
  key: 'validators.validation' | 'asyncValidators.validation';
  /**
   * Available custom validator types and their options.
   */
  validationOptions: CustomValidationOption[];
};

export interface CustomValidation {
  name: string;
  options?: Record<string, unknown>;
}

export interface CustomValidationOption {
  /**
   * Display label for this validator option.
   */
  label: string;
  /**
   * Value/key used to identify the validator.
   */
  value: string;
  /**
   * Optional properties describing additional configuration options
   * for this custom validator.
   */
  optionProperties?: PropertyConfig[];
}

export const createCustomValidationProperty: PropertyCreator<
  CustomValidationPropertyConfig,
  CustomValidationPropertyConfig
> = (v) => ({
  ...v,
  type: PropertyType.CUSTOM_VALIDATION,
});
