import { InjectionToken } from '@angular/core';
import { FormlyFieldConfig, FormlyFieldConfigCache, FormlyTemplateOptions } from '@ngx-formly/core';

import { IProperty } from './property/property.types';

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
    canHaveChildren?: boolean;
    childrenPath?: string; // Lodash path
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
    canHaveChildren?: boolean;
    childrenPath?: string;
}

export interface EditorConfig {
    defaultType: string;
    defaultUnknownType?: string;
    options: FieldOption[];
}

export const EDITOR_FIELD_SERVICE = new InjectionToken<IEditorFieldService>('EDITOR_FIELD_SERVICE');
export const EDITOR_CONFIG = new InjectionToken<EditorConfig[]>('EDITOR_CONFIG');
