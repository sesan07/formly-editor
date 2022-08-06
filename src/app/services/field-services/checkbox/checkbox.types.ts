import { FormlyTemplateOptions } from '@ngx-formly/core';

export interface ICheckboxTemplateOptions extends FormlyTemplateOptions {
    label: string;
    description: string;
    pattern: string;
    required: boolean;
}
