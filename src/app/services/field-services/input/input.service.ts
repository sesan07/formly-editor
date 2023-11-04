import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType } from '../field.types';
import { IInputProps } from './input.types';

@Injectable({
    providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputProps> {
    public getDefaultField(type: AppFieldType): FormlyFieldConfig<IInputProps> {
        const config: FormlyFieldConfig<IInputProps> = {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            props: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
            },
        };

        if (type === AppFieldType.NUMBER || type === AppFieldType.INTEGER) {
            config.props.type = 'number';
        }

        return config;
    }

    protected _getFieldProperties(): IProperty[] {
        return [
            {
                name: 'Type',
                key: 'props.type',
                type: PropertyType.TEXT,
            },
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
