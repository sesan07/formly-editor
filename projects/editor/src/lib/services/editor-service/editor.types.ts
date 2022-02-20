import { InjectionToken } from '@angular/core';
import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { IProperty } from '../../components/property/property.types';

export enum FieldType {
    FORMLY_GROUP = 'formly-group',
}

export enum WrapperType {
    EDITOR = 'editor',
}

export interface IBaseFormlyField<T = FormlyTemplateOptions> extends FormlyFieldConfig {
    type: string;
    customType?: string;
	templateOptions: T; // TODO make optional. property should initialize key in target of empty
    wrappers: string[]; // TODO remove this. property should initialize key in target of empty
    fieldGroup?: IBaseFormlyField[];
    expressionProperties: { // TODO remove this. property should initialize key in target of empty
        [property: string]: string | ((model: any, formState: any, field?: FormlyFieldConfig) => any) | Observable<any>;
    };
}

export interface IEditorFormlyField extends IBaseFormlyField {
    name: string;
    fieldGroup?: IEditorFormlyField[];
    fieldProperties: IProperty[];
    formId: string;
    fieldId: string;
    parentFieldId?: string;
    canHaveChildren?: boolean;
    childrenPath?: string; // Lodash path
}

export interface IForm {
    id: string;
    name: string;
	activeField: IEditorFormlyField;
    fields: IEditorFormlyField[];
    fieldMap: Map<string, IEditorFormlyField>;
    model: Record<string, unknown>;
}

export interface IFieldService {
    getDefaultConfig(type: string, customType?: string): IBaseFormlyField;
    getProperties(type: string): IProperty[];
}

export const EDITOR_FIELD_SERVICE = new InjectionToken<IFieldService>('EDITOR_FIELD_SERVICE');
