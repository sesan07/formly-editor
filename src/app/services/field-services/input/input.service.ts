import { Injectable } from '@angular/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType, IFormlyField } from '../field.types';
import { IInputTemplateOptions } from './input.types';

@Injectable({
    providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {
    public getDefaultField(type: AppFieldType): IFormlyField<IInputTemplateOptions> {
        const config: IFormlyField<IInputTemplateOptions> = {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
            },
        };

        if (type === AppFieldType.NUMBER || type === AppFieldType.INTEGER) {
            config.templateOptions.type = 'number';
        }

        return config;
    }

    protected _getFieldProperties(): IProperty[] {
        return [
            {
                name: 'Type',
                key: 'templateOptions.type',
                type: PropertyType.TEXT,
            },
            {
                name: 'Label',
                key: 'templateOptions.label',
                type: PropertyType.TEXT,
            },
            {
                name: 'Placeholder',
                key: 'templateOptions.placeholder',
                type: PropertyType.TEXT,
            },
            {
                name: 'Description',
                key: 'templateOptions.description',
                type: PropertyType.TEXT,
            },
            {
                name: 'Required',
                key: 'templateOptions.required',
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
