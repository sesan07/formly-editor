import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IBaseFormlyField } from 'editor';

export enum AppFieldType {
    CHECKBOX = 'checkbox',
    FORMLY_GROUP = 'formly-group',
    INPUT = 'input',
    OTHER = 'other',
    RADIO = 'radio',
    REPEATING_SECTION = 'repeating-section',
    SELECT = 'select',
    TEXTAREA = 'textarea',
}

export enum AppCustomFieldType {
    NUMBER = 'number',
    CARD = 'card',
}

export enum AppWrapperType {
    FORM_FIELD = 'form-field',
    CARD = 'card',
}

export interface IFormlyField<T = FormlyTemplateOptions> extends IBaseFormlyField<T> {
    fieldGroup?: IFormlyField[];
}
