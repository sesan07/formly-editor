import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IBaseFormlyField } from 'editor';

export enum FieldType {
    CHECKBOX = 'checkbox',
    FORMLY_GROUP = 'formly-group',
    INPUT = 'input',
    OTHER = 'other',
    RADIO = 'radio',
    REPEATING_SECTION = 'repeating-section',
    SELECT = 'select',
    TEXTAREA = 'textarea',
}

export enum CustomFieldType {
    NUMBER = 'number',
    CARD = 'card',
}

export enum WrapperType {
    FORM_FIELD = 'form-field',
    CARD = 'card',
}

export interface IFormlyField<T = FormlyTemplateOptions> extends IBaseFormlyField<T> {
    fieldGroup?: IFormlyField[];
}

export interface IForm {
    id: string;
    name: string;
    activeField: IFormlyField;
    fields: IFormlyField[];
    fieldMap: Map<string, IFormlyField>;
    model: Record<string, unknown>;
}
