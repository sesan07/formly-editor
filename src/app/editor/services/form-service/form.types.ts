import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { IProperty } from '../../components/property/property.types';

export enum FieldType {
    CHECKBOX = 'checkbox',
    FORMLY_GROUP = 'formly-group',
    INPUT = 'input',
    OTHER = 'other',
    RADIO = 'radio',
    SELECT = 'select',
    TEXTAREA = 'textarea',
}

export enum WrapperType {
    EDITOR = 'editor',
    FORM_FIELD = 'form-field',
}

export interface IBaseEditorFormlyField<T = FormlyTemplateOptions> extends FormlyFieldConfig {
    name: string;
	type: FieldType;
	templateOptions?: T;
    fieldGroup?: IEditorFormlyField[];
    expressionProperties: {
        [property: string]: string | ((model: any, formState: any, field?: FormlyFieldConfig) => any) | Observable<any>;
    };
    fieldProperties: IProperty[];
    formId: string;
    fieldId: string;
    parentFieldId?: string;
}

export interface IForm {
    id: string;
    name: string;
	activeField: IEditorFormlyField;
    fields: IEditorFormlyField[];
    fieldMap: Map<string, IEditorFormlyField>;
    model: Record<string, unknown>;
}


export type IEditorFormlyField = IBaseEditorFormlyField;
