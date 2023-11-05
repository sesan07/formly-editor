import { FormlyFieldProps } from '@ngx-formly/core';

export interface IRadioProps extends FormlyFieldProps {
    label: string;
    placeholder: string;
    description: string;
    required: boolean;
}
