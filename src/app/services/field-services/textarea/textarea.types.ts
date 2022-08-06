import { FormlyTemplateOptions } from '@ngx-formly/core';

export interface ITextareaTemplateOptions extends FormlyTemplateOptions {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
}
