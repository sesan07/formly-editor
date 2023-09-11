import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IBaseFormlyField } from '@sesan07/ngx-formly-editor';

export enum AppFieldType {
    CHECKBOX = 'checkbox',
    FORMLY_GROUP = 'formly-group',
    FORMLY_GROUP_CARD = 'formly-group-card',
    INPUT = 'input',
    NUMBER = 'number',
    INTEGER = 'integer',
    OTHER = 'other',
    RADIO = 'radio',
    REPEATING_SECTION = 'repeating-section',
    SELECT = 'select',
    TEXTAREA = 'textarea',
}

export enum AppWrapperType {
    FORM_FIELD = 'form-field',
    CARD = 'card',
}

export interface IFormlyField<T = FormlyTemplateOptions> extends IBaseFormlyField<T> {
    fieldGroup?: IFormlyField[];
}
