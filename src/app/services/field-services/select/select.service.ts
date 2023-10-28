import { Injectable } from '@angular/core';
import { BaseFieldService, IArrayProperty, IObjectProperty, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType, IFormlyField } from '../field.types';
import { ISelectProps } from './select.types';

@Injectable({
    providedIn: 'root',
})
export class SelectService extends BaseFieldService<ISelectProps> {
    public getDefaultField(type: AppFieldType): IFormlyField<ISelectProps> {
        return {
            type,
            wrappers: [AppWrapperType.FORM_FIELD],
            props: {
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
                name: 'Select all options label',
                key: 'props.selectAllOption',
                type: PropertyType.TEXT,
            },
            {
                name: 'Multiple selections',
                key: 'props.multiple',
                type: PropertyType.BOOLEAN,
            },
            {
                name: 'Required',
                key: 'props.required',
                type: PropertyType.BOOLEAN,
            },
            {
                name: 'Options',
                key: 'props.options',
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

    protected _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
