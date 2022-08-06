import { FormlyTemplateOptions } from '@ngx-formly/core';

export interface IInputTemplateOptions extends FormlyTemplateOptions {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
}
