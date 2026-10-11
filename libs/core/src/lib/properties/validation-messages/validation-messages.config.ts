import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export type ValidationMessagesPropertyConfig = BasePropertyConfig & {
  type: PropertyType.VALIDATION_MESSAGES;
  key: 'validation.messages' | 'widget.formlyConfig.validation.messages';
  /**
   * List of validators that can be configured with custom messages.
   */
  validationOptions: ValidationOption[];
};

export interface ValidationMessage {
  key: string;
  value: string;
}

export interface ValidationOption {
  /**
   * Human readable label for the validator.
   */
  label: string;
  /**
   * Validator key used in the field/configuration.
   */
  value: string;
}

export const createValidationMessagesProperty: PropertyCreator<
  ValidationMessagesPropertyConfig,
  ValidationMessagesPropertyConfig
> = (v) => ({
  ...v,
  type: PropertyType.VALIDATION_MESSAGES,
});
