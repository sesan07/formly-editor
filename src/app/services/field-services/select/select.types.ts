import { FormlyTemplateOptions } from '@ngx-formly/core';

export interface ISelectTemplateOptions extends FormlyTemplateOptions {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
    multiple?: boolean;
    selectAllOption?: string;
    options?: ISelectOption[];
}

interface ISelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}
