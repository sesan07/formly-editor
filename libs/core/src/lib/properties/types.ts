import type { ArrayPropertyConfig } from './array/array.config';
import type { BooleanPropertyConfig } from './boolean/boolean.config';
import { DatePropertyConfig } from './date/date.config';
import type { InputPropertyConfig } from './input/input.config';
import type { ObjectPropertyConfig } from './object/object.config';
import { ChipsPropertyConfig } from './chips/chips.config';
import { CustomValidationPropertyConfig } from './custom-validation/custom-validation.config';
import type { ExpressionsPropertyConfig } from './expressions/expressions.config';
import type { GroupPropertyConfig } from './group/group.config';
import type { MarkdownPropertyConfig } from './markdown/markdown.config';
import type { SelectPropertyConfig } from './select/select.config';
import { ValidationMessagesPropertyConfig } from './validation-messages/validation-messages.config';
import type { WrappersPropertyConfig } from './wrappers/wrappers.config';

export enum PropertyType {
  // Basic
  BOOLEAN = 'Boolean',
  INPUT = 'Input',
  MARKDOWN = 'Markdown',
  DATE = 'Date',
  OBJECT = 'Object',
  GROUP = 'Group',
  ARRAY = 'Array',

  // Complex
  SELECT = 'Select',
  CHIPS = 'Chips',
  WRAPPERS = 'Wrappers',
  EXPRESSIONS = 'Expressions',
  VALIDATION_MESSAGES = 'Validation Messages',
  CUSTOM_VALIDATION = 'Custom Validation',
}

export interface BasePropertyConfig {
  /**
   * Identifies the property kind.
   */
  type: PropertyType;
  /**
   * Label shown in the UI for this property.
   */
  label?: string;
  /**
   * Short description or help text used for tooltips.
   */
  description?: string;
  /**
   * Optional key or path segment associated with this property.
   */
  key?: string;
  /**
   * When true, the property may be removed by the user in the UI.
   */
  isRemovable?: boolean;
  /**
   * When true, the property's key may be edited by the user.
   */
  isKeyEditable?: boolean;
  /**
   * When true, this property is required.
   */
  isRequired?: boolean;
  /**
   * Column span used when rendering this property in a grid layout.
   */
  colSpan?: number;
}

export enum PropertyChangeType {
  KEY,
  VALUE,
  CLEAR,
}

export interface PropertyChange {
  type: PropertyChangeType;
  path: string[];
  newPath?: string[];
  value?: unknown;
}

export type PropertyConfig =
  | ArrayPropertyConfig
  | BooleanPropertyConfig
  | ChipsPropertyConfig
  | CustomValidationPropertyConfig
  | DatePropertyConfig
  | ExpressionsPropertyConfig
  | InputPropertyConfig
  | MarkdownPropertyConfig
  | ObjectPropertyConfig
  | GroupPropertyConfig
  | SelectPropertyConfig
  | WrappersPropertyConfig
  | ValidationMessagesPropertyConfig;

export type PropertyCreator<T extends BasePropertyConfig, V extends BasePropertyConfig> = (
  property: Omit<T, 'type'>,
) => V;
