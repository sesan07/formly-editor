import { Injectable } from '@angular/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType } from '../field.types';
import { ICheckboxProps } from './checkbox.types';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Injectable({
    providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxProps> {
    public getDefaultField(type: AppFieldType): FormlyFieldConfig<ICheckboxProps> {
        return {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            props: {
                label: 'Accept terms',
                description: 'In order to proceed, please accept terms',
                pattern: 'true',
                required: true,
            },
            validation: {
                messages: {
                    pattern: 'Please accept the terms',
                },
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
                name: 'Description',
                key: 'props.description',
                type: PropertyType.TEXT,
            },
            {
                name: 'Required',
                key: 'props.required',
                type: PropertyType.BOOLEAN,
            },
            {
                name: 'Pattern',
                key: 'props.pattern',
                type: PropertyType.TEXT,
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
