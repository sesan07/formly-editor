import { FormlyTemplateOptions } from '@ngx-formly/core';

export interface IRadioTemplateOptions extends FormlyTemplateOptions {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
}
