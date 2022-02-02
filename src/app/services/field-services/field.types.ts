import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { IProperty } from 'src/app/editor/components/property/property.types';
import { IBaseEditorFormlyField } from 'src/app/editor/services/form-service/form.types';

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

export interface IEditorFormlyField<T = FormlyTemplateOptions> extends IBaseEditorFormlyField {
    name: string;
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
