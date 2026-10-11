import type { BooleanPropertyConfig } from '../boolean/boolean.config';
import type { DatePropertyConfig } from '../date/date.config';
import type { InputPropertyConfig } from '../input/input.config';
import type { CustomValidationPropertyConfig } from '../custom-validation/custom-validation.config';
import type { SelectPropertyConfig } from '../select/select.config';
import type { PropertyConfig } from '../types';

export type ValidationRulePropertyConfig =
  BooleanPropertyConfig | DatePropertyConfig | InputPropertyConfig | SelectPropertyConfig;

export interface ValidationRuleConfig {
  /** Formly validator name used as the key in validation.messages. */
  name: string;
  /** Property control that configures the validator. */
  property: ValidationRulePropertyConfig;
}

export interface FieldValidationConfig {
  /** Fixed built-in validation rules supported by this field type. */
  rules: ValidationRuleConfig[];
  /** Optional synchronous custom validator section. */
  customValidators?: CustomValidationPropertyConfig;
  /** Optional asynchronous custom validator section. */
  asyncValidators?: CustomValidationPropertyConfig;
  /** Additional validation display controls such as validation.show. */
  displayProperties?: PropertyConfig[];
}
