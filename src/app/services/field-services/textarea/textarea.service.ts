import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType } from '../field.types';
import { ITextareaProps } from './textarea.types';

@Injectable({
    providedIn: 'root',
})
export class TextareaService extends BaseFieldService<ITextareaProps> {
    public getDefaultField(type: AppFieldType): FormlyFieldConfig<ITextareaProps> {
        return {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            props: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
            },
        };
    }

    protected _getFieldProperties(): IProperty[] {
        return [
            {
                name: 'Label',
                key: 'props.label',
                type: PropertyType.TEXT,
            },
            {
                name: 'Placeholder',
                key: 'props.placeholder',
                type: PropertyType.TEXT,
            },
            {
                name: 'Description',
                key: 'props.description',
                type: PropertyType.TEXT,
            },
            {
                name: 'Required',
                key: 'props.required',
                type: PropertyType.BOOLEAN,
            },
        ];
    }

    protected _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
