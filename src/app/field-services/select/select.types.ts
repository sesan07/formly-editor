import { FormlyFieldProps } from '@ngx-formly/core';

export interface ISelectProps extends FormlyFieldProps {
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
