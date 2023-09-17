import { InjectionToken } from '@angular/core';
import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';

import { IProperty } from './property/property.types';
import { FormlyFieldConfigCache } from './custom-formly/fieldconfig.cache';

export enum FieldType {
    FORMLY_GROUP = 'formly-group',
}

export type GetDefaultField = (type: string) => IBaseFormlyField;
export type GetTypeOption = (type: string) => FieldTypeOption;

export interface IEditorFieldInfo {
    name: string;
    formId: string;
    fieldId: string;
    parentFieldId?: string;
    fieldPath: string[];
    childrenConfig?: FieldTypeChildrenConfig;
}

export interface IBaseFormlyField<T = FormlyTemplateOptions> extends FormlyFieldConfig {
    type: string;
    templateOptions?: T;
    fieldGroup?: IBaseFormlyField[];
}

export interface IEditorFormlyField extends IBaseFormlyField {
    _info: IEditorFieldInfo;
    fieldGroup?: IEditorFormlyField[];
}

export interface IForm {
    id: string;
    name: string;
    fields: IEditorFormlyField[];
    baseFields: IEditorFormlyField[];
    model: Record<string, unknown>;
    activeFieldId?: string;
    isEditMode: boolean;
    fieldIdCounter: number;
}

export interface IEditorFieldService {
    getDefaultField: GetDefaultField;
    getProperties(type: string): IProperty[];
}

export type IEditorFormlyFieldConfigCache = IEditorFormlyField & FormlyFieldConfigCache;

export type FieldOption = FieldCategoryOption | FieldTypeOption;

export interface FieldCategoryOption {
    displayName: string;
    children: FieldTypeOption[];
}

export interface FieldTypeOption {
    type: string;
    displayName: string;
    keyGenerationPrefix?: string;
    disableKeyGeneration?: boolean; // Prevent auto generating keys
    childrenConfig?: FieldTypeChildrenConfig;
}

export interface FieldTypeChildrenConfig {
    path: string; // Lodash path for children
    isObject?: boolean; // Whether child is a single object instead of a list of children
}

export interface EditorConfig {
    defaultType: string;
    defaultUnknownType?: string;
    options: FieldOption[];
}

export const EDITOR_FIELD_SERVICE = new InjectionToken<IEditorFieldService>('EDITOR_FIELD_SERVICE');
export const EDITOR_CONFIG = new InjectionToken<EditorConfig[]>('EDITOR_CONFIG');
