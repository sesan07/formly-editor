import { FormlyFieldProps } from '@ngx-formly/core';

export interface ICheckboxProps extends FormlyFieldProps {
    label: string;
    description: string;
    pattern: string;
    required: boolean;
}
