import { Injectable } from '@angular/core';
import { BaseFieldService, IBaseFormlyField, IProperty, PropertyType } from 'editor';

import { IInputTemplateOptions } from './input.types';
import { AppCustomFieldType, AppFieldType, IFormlyField, AppWrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {
    public getDefaultConfig(customType?: AppCustomFieldType): IFormlyField<IInputTemplateOptions> {
        const config: IFormlyField<IInputTemplateOptions> = {
            type: AppFieldType.INPUT,
            wrappers: [AppWrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
            },
        };

        switch (customType) {
            case AppCustomFieldType.NUMBER:
                config.name = 'Number';
                config.customType = customType;
                config.templateOptions.type = 'number';
        }

        return config;
    }

    protected override _getFieldTemplateOptions(): IProperty[] {
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

    protected override _getWrapperTemplateOptions(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
