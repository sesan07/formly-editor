import { FormlyFieldProps } from '@ngx-formly/core';
import { IBaseFormlyField } from '@sesan07/ngx-formly-editor';

export enum AppFieldType {
    CHECKBOX = 'checkbox',
    FORMLY_GROUP = 'formly-group',
    INPUT = 'input',
    NUMBER = 'number',
    INTEGER = 'integer',
    RADIO = 'radio',
    SELECT = 'select',
    TEXTAREA = 'textarea',
}

export enum AppWrapperType {
    FORM_FIELD = 'form-field',
}

export interface IFormlyField<T = FormlyFieldProps> extends IBaseFormlyField<T> {
    fieldGroup?: IFormlyField[];
}
