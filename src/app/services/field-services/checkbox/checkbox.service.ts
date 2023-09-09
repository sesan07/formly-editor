import { Injectable } from '@angular/core';
import { BaseFieldService, IBaseFormlyField, IProperty, PropertyType } from 'editor';

import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { ICheckboxTemplateOptions } from './checkbox.types';

@Injectable({
    providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType): IFormlyField<ICheckboxTemplateOptions> {
        return {
            type: FieldType.CHECKBOX,
            wrappers: [WrapperType.FORM_FIELD],
            templateOptions: {
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

    protected override _getFieldTemplateOptions(): IProperty[] {
        return [
            {
                name: 'Label',
                key: 'templateOptions.label',
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
                name: 'Pattern',
                key: 'templateOptions.pattern',
                type: PropertyType.TEXT,
            },
        ];
    }

    protected override _getWrapperTemplateOptions(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.FORM_FIELD];
    }
}
