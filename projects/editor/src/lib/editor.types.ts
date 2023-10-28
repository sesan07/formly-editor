import { InjectionToken, Type } from '@angular/core';
import { FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';

import { FormlyFieldConfigCache } from './custom-formly/fieldconfig.cache';
import { BaseFieldService } from './field-service/base-field.service';
import { IProperty } from './property/property.types';
import { IStylesConfig } from './edit-field/styles/styles.types';

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

// TODO remove this?
export interface IBaseFormlyField<T = FormlyFieldProps> extends FormlyFieldConfig {
    type: string;
    templateOptions?: T;
    props?: T;
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
    model: object;
    activeFieldId?: string;
    isEditMode: boolean;
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
    service: Type<BaseFieldService<FormlyFieldProps>>;
}

export interface FieldTypeChildrenConfig {
    path: string; // Lodash path for children
    isObject?: boolean; // Whether child is a single object instead of a list of children
}

export interface EditorConfig {
    options: FieldOption[];
    autosaveDelay?: number;
    stylesConfig?: IStylesConfig;
    onDisplayFields?: (fields: IEditorFormlyField[], model: Record<string, any>) => IEditorFormlyField[];
}

export const EDITOR_CONFIG = new InjectionToken<EditorConfig[]>('EDITOR_CONFIG');
