import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IBaseEditorFormlyField } from 'editor';

export enum FieldType {
    CHECKBOX = 'checkbox',
    FORMLY_GROUP = 'formly-group',
    INPUT = 'input',
    OTHER = 'other',
    RADIO = 'radio',
    SELECT = 'select',
    TEXTAREA = 'textarea',
}

export enum CustomFieldType {
    NUMBER = 'number',
    CARD = 'card',
}

export enum WrapperType {
    EDITOR = 'editor',
    FORM_FIELD = 'form-field',
    CARD = 'card',
}

export interface IEditorFormlyField<T = FormlyTemplateOptions> extends IBaseEditorFormlyField {
	templateOptions?: T;
    fieldGroup?: IEditorFormlyField[];
}

export interface IForm {
    id: string;
    name: string;
	activeField: IEditorFormlyField;
    fields: IEditorFormlyField[];
    fieldMap: Map<string, IEditorFormlyField>;
    model: Record<string, unknown>;
}
