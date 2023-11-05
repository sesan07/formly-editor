import { FormlyFieldProps } from '@ngx-formly/core';

export interface ITextareaProps extends FormlyFieldProps {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
}
