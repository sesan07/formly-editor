import { Injectable } from '@angular/core';
import { BaseFieldService, IArrayProperty, IObjectProperty, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, IFormlyField, AppWrapperType } from '../field.types';
import { IRadioTemplateOptions } from './radio.types';

@Injectable({
    providedIn: 'root',
})
export class RadioService extends BaseFieldService<IRadioTemplateOptions> {
    public getDefaultConfig(type: AppFieldType): IFormlyField<IRadioTemplateOptions> {
        return {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
                options: [
                    { value: 1, label: 'Option 1' },
                    { value: 2, label: 'Option 2' },
                    { value: 3, label: 'Option 3' },
                    { value: 4, label: 'Option 4', disabled: true },
                ],
            },
        };
    }

    protected override _getFieldTemplateOptions(): IProperty[] {
        return [
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
            {
                name: 'Options',
                key: 'templateOptions.options',
                type: PropertyType.ARRAY,
                canAdd: true,
                childProperty: {
                    type: PropertyType.OBJECT,
                    isRemovable: true,
                    childProperties: [
                        {
                            name: 'Label',
                            key: 'label',
                            type: PropertyType.TEXT,
                        },
                        {
                            name: 'Value',
                            key: 'value',
                            type: PropertyType.TEXT,
                            outputRawValue: true,
                        },
                        {
                            name: 'Disabled',
                            key: 'disabled',
                            type: PropertyType.BOOLEAN,
                        },
                    ],
                } as IObjectProperty,
            } as IArrayProperty,
        ];
    }

    protected override _getWrapperTemplateOptions(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
