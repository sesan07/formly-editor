import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { IProperty } from 'src/app/components/property/property.types';

export enum FieldType {
    FORMLY_GROUP = 'formly-group',
    INPUT = 'input',
    OTHER = 'other',
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
