import { InjectionToken } from '@angular/core';
import {
    ConfigOption,
    FormlyFieldConfig,
    FormlyFieldConfigCache,
    FormlyTemplateOptions,
    TypeOption,
} from '@ngx-formly/core';

import { IProperty } from './property/property.types';

export enum FieldType {
    FORMLY_GROUP = 'formly-group',
}

export type GetDefaultField = (type: string, customType?: string, sourceField?: IBaseFormlyField) => IBaseFormlyField;
export type GetTypeOption = (type: string, customType?: string) => EditorTypeOption;

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
    customType?: string;
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

export interface IFieldService {
    getDefaultField: GetDefaultField;
    getFieldProperties(type: string): IProperty[];
}

export type IEditorFormlyFieldConfigCache = IEditorFormlyField & FormlyFieldConfigCache;

export interface EditorTypeOption extends TypeOption {
    displayName: string;
    name: string;
    customName?: string;
    canHaveChildren?: boolean;
    childrenPath?: string;
}

export interface EditorTypeCategoryOption {
    name: string;
    typeOptions: EditorTypeOption[];
}

export interface EditorConfigOption extends ConfigOption {
    defaultName: string;
    defaultCustomName?: string;
    unknownTypeName?: string;
    typeCategories: EditorTypeCategoryOption[];
}

export const EDITOR_FIELD_SERVICE = new InjectionToken<IFieldService>('EDITOR_FIELD_SERVICE');
export const EDITOR_CONFIG = new InjectionToken<EditorConfigOption[]>('EDITOR_CONFIG');
