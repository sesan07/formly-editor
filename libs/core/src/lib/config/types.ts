import { InjectionToken } from '@angular/core';
import { ConfigOption, FormlyFieldConfig } from '@ngx-formly/core';
import { ZodType } from 'zod';
import { DefaultForm } from '../model/types';
import { PropertyConfig } from '../properties/types';
import type { FieldValidationConfig } from '../properties/validation-messages/validation.types';

/**
 * A category of field types shown in the UI.
 */
export interface FieldCategoryOption {
  /** The category label shown to users. */
  displayName: string;
  /** The field type options that belong to this category. */
  children: FieldTypeOption[];
}

export interface FieldCategoryPreset {
  displayName: string;
  children: FieldTypePreset[];
}

/**
 * A field type option describing how a particular field type behaves.
 */
export interface FieldTypeOption {
  isFieldArray?: boolean;
  /** Unique type name (used as `type`). */
  name: string;
  /** Human friendly name shown in the palette. */
  displayName: string;
  /** Optional prefix used when generating field keys. */
  keyGenerationPrefix?: string;
  /** When true prevents automatic key generation. */
  disableKeyGeneration?: boolean;
  /** Marks the type as a container/parent type. */
  isParent?: boolean;
  /** Default Formly config used when inserting this field. */
  defaultConfig: FormlyFieldConfig;
  /** Optional wrappers available for this field type. */
  wrapperOptions?: FieldWrapperOption[];
  /** Icon identifier (UI-specific) for the type. */
  materialSymbol: string;
  /** Optional editor property descriptors for configuring this type. */
  properties?: PropertyConfig[];
  /** Optional editor configuration for validation rules and their messages. */
  validationConfig?: FieldValidationConfig;
  /** Optional preset field instances for quick insertion. */
  initialPresets?: FieldTypePreset[];
}

export interface FieldTypePreset {
  id: string;
  displayName: string;
  field: FormlyFieldConfig;
  isRemovable?: boolean;
  /**
   * Not intended for public configuration.
   * @internal
   */
  typeOption?: FieldTypeOption;
}

/**
 * Wrapper (container) option description.
 */
export interface FieldWrapperOption {
  /** Wrapper key used by Formly. */
  name: string;
  /** Human friendly name shown in the field editor. */
  label: string;
  /** Optional editor properties exposed for the wrapper. */
  properties?: PropertyConfig[];
}
/**
 * Global configuration for the core editor.
 */
export interface LibraryConfig {
  /** Unique configuration id used to route editor operations. */
  id: string;
  /** Categories and their field types shown in the palette. */
  fieldCategoryOptions: FieldCategoryOption[];
  /** Enable JSON schema validation in the form import dialog. */
  enableFormUploadSchema?: boolean;
  formTemplates: DefaultForm[];
  label: string;
  configOptions: ConfigOption[];
  /** Optional Formly configuration loaded only for builder contexts. */
  builderConfigOptions?: ConfigOption[];
  schema: ZodType;
  /** Default type option applied to unknown types. */
  defaultTypeOption: FieldTypeOption;
}

export interface CoreEditorConfig {
  editorType: string;
  defaultTypeOption: FieldTypeOption;
  /** Enable debounced persistence for active form mutations. */
  autoSave?: boolean;
  /** Delay in milliseconds before an active form mutation is persisted. */
  autoSaveDelay?: number;
}

export const CORE_EDITOR_CONFIG = new InjectionToken<CoreEditorConfig>('CoreLibraryEditorConfig');
export const CORE_LIBRARY_CONFIGS = new InjectionToken<LibraryConfig[]>('CoreLibraryConfigs');
