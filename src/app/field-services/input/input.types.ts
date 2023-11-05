import { FormlyFieldProps } from '@ngx-formly/core';

export interface IInputProps extends FormlyFieldProps {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
}
