import { Injectable } from '@angular/core';
import { IProperty, PropertyType, IObjectProperty, IArrayProperty } from 'editor';

import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { ISelectTemplateOptions } from './select.types';

@Injectable({
    providedIn: 'root',
})
export class SelectService extends BaseFieldService<ISelectTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType): IFormlyField<ISelectTemplateOptions> {
        return {
            type: FieldType.SELECT,
            wrappers: [WrapperType.FORM_FIELD],
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

    protected _getTOChildProperties(): IProperty[] {
        return [
            {
                name: 'Label',
                key: 'templateOptions.label',
                type: PropertyType.TEXT,
                isSimple: true,
            },
            {
                name: 'Placeholder',
                key: 'templateOptions.placeholder',
                type: PropertyType.TEXT,
                isSimple: true,
            },
            {
                name: 'Description',
                key: 'templateOptions.description',
                type: PropertyType.TEXT,
                isSimple: true,
            },
            {
                name: 'Select all options label',
                key: 'templateOptions.selectAllOption',
                type: PropertyType.TEXT,
                isSimple: true,
            },
            {
                name: 'Multiple selections',
                key: 'templateOptions.multiple',
                type: PropertyType.BOOLEAN,
                isSimple: true,
            },
            {
                name: 'Required',
                key: 'templateOptions.required',
                type: PropertyType.BOOLEAN,
                isSimple: true,
            },
            {
                name: 'Options',
                key: 'templateOptions.options',
                type: PropertyType.ARRAY,
                isSimple: true,
                canAdd: true,
                childProperty: {
                    type: PropertyType.OBJECT,
                    isRemovable: true,
                    childProperties: [
                        {
                            name: 'Label',
                            key: 'label',
                            type: PropertyType.TEXT,
                            isSimple: true,
                        },
                        {
                            name: 'Value',
                            key: 'value',
                            type: PropertyType.TEXT,
                            outputRawValue: true,
                            isSimple: true,
                        },
                        {
                            name: 'Disabled',
                            key: 'disabled',
                            type: PropertyType.BOOLEAN,
                            isSimple: true,
                        },
                    ],
                } as IObjectProperty,
            } as IArrayProperty,
        ];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.FORM_FIELD];
    }
}
