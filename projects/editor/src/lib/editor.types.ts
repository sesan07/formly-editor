import { InjectionToken } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

import { FormlyFieldConfigCache } from './custom-formly/fieldconfig.cache';
import { IStylesConfig } from './edit-field/styles/styles.types';
import { IProperty } from './property/property.types';

export enum EditorFieldType {
    FORMLY_GROUP = 'formly-group',
    GENERIC = 'generic',
}

export enum DropAction {
    COPY = 'copy',
    MOVE = 'move',
}

export enum DragType {
    FORMLY_FIELD = 'formly-field',
}

export type GetDefaultField = (type: string) => FormlyFieldConfig;
export type GetTypeOption = (type: string) => FieldTypeOption;

export interface IEditorFieldInfo {
    name: string;
    formId: string;
    fieldId: string;
    parentFieldId?: string;
    fieldPath: string[];
    childrenConfig?: FieldTypeChildrenConfig;
}

export interface IEditorFormlyField extends FormlyFieldConfig {
    _info: IEditorFieldInfo;
    fieldGroup?: IEditorFormlyField[];
}

export interface IForm {
    id: string;
    name: string;
    fields: IEditorFormlyField[];
    baseFields: IEditorFormlyField[];
    model: object;
    activeFieldId?: string;
    isEditMode: boolean;
}

export interface IDefaultForm {
    name: string;
    fields: FormlyFieldConfig[];
    model: object;
}

export type IEditorFormlyFieldConfigCache = IEditorFormlyField & FormlyFieldConfigCache;

export type FieldOption = FieldCategoryOption | FieldTypeOption;

export interface FieldCategoryOption {
    displayName: string;
    children: FieldTypeOption[];
}

export interface FieldTypeOption {
    name: string;
    displayName: string;
    keyGenerationPrefix?: string;
    disableKeyGeneration?: boolean; // Prevent auto generating keys
    childrenConfig?: FieldTypeChildrenConfig;
    defaultConfig: FormlyFieldConfig;
    properties?: IProperty[];
}

export interface FieldTypeChildrenConfig {
    path: string; // Dot separated lodash path for children
    isObject?: boolean; // Whether child is a single object instead of a list of children
}

export interface FieldWrapperOption {
    name: string;
    properties?: IProperty[];
}

export interface ValidatorOption {
    name: string;
    key: string;
}

export interface EditorConfig {
    id: string;
    fieldOptions: FieldOption[];
    wrapperOptions?: FieldWrapperOption[];
    genericTypeOption?: FieldTypeOption;
    validatorOptions?: ValidatorOption[];
    asyncValidatorOptions?: ValidatorOption[];
    defaultForm?: IDefaultForm;
    stylesConfig?: IStylesConfig;
    autoSaveDelay?: number;
    onDisplayFields?: (fields: IEditorFormlyField[], model: Record<string, any>) => IEditorFormlyField[];
}

export const EDITOR_CONFIG = new InjectionToken<EditorConfig>('EDITOR_CONFIG');
