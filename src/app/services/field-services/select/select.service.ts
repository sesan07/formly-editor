import { Injectable } from '@angular/core';
import { IProperty, PropertyType, IObjectProperty, IArrayProperty, BaseFieldService } from '@sesan07/ngx-formly-editor';

import { AppFieldType, IFormlyField, AppWrapperType } from '../field.types';
import { ISelectTemplateOptions } from './select.types';

@Injectable({
    providedIn: 'root',
})
export class SelectService extends BaseFieldService<ISelectTemplateOptions> {
    public getDefaultField(type: AppFieldType): IFormlyField<ISelectTemplateOptions> {
        return {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
                multiple: true,
                selectAllOption: 'Select All',
                options: [
                    { value: 1, label: 'Option 1' },
                    { value: 2, label: 'Option 2' },
                    { value: 3, label: 'Option 3' },
                    { value: 4, label: 'Option 4', disabled: true },
                ],
            },
        };
    }

    protected override _getFieldProperties(): IProperty[] {
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
                name: 'Select all options label',
                key: 'templateOptions.selectAllOption',
                type: PropertyType.TEXT,
            },
            {
                name: 'Multiple selections',
                key: 'templateOptions.multiple',
                type: PropertyType.BOOLEAN,
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

    protected override _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
