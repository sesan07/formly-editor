import { InjectionToken } from '@angular/core';
import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { IProperty } from '../../components/property/property.types';
import { EditorFieldConfig } from '../../editor.types';

export enum FieldType {
    FORMLY_GROUP = 'formly-group',
}

export enum WrapperType {
    EDITOR = 'editor',
}

export interface IBaseEditorFormlyField<T = FormlyTemplateOptions> extends FormlyFieldConfig {
    name: string;
    type: string;
    customType?: string;
	templateOptions?: T;
    fieldGroup?: IBaseEditorFormlyField[];
    expressionProperties: {
        [property: string]: string | ((model: any, formState: any, field?: FormlyFieldConfig) => any) | Observable<any>;
    };
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
	activeField: IBaseEditorFormlyField;
    fields: IBaseEditorFormlyField[];
    fieldMap: Map<string, IBaseEditorFormlyField>;
    model: Record<string, unknown>;
}

export interface IFieldService {
    // getNextKey(): string;
    getNextFieldId(type: string, customType?: string): string;
    getDefaultConfig(type: string, formId: string, customType?: string, parentFieldId?: string): IBaseEditorFormlyField;
    getProperties(type: string, customType?: string): IProperty[];
}

export const EDITOR_FIELD_SERVICE = new InjectionToken<IFieldService>('EDITOR_FIELD_SERVICE');

// export type IEditorFormlyField = IBaseEditorFormlyField;
