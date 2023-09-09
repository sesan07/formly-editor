import { Injectable } from '@angular/core';
import { BaseFieldService, IBaseFormlyField, IProperty, PropertyType } from 'editor';

import { AppCustomFieldType, AppFieldType, IFormlyField, AppWrapperType } from '../field.types';
import { ICheckboxTemplateOptions } from './checkbox.types';

@Injectable({
    providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxTemplateOptions> {
    public getDefaultConfig(customType?: AppCustomFieldType): IFormlyField<ICheckboxTemplateOptions> {
        return {
            type: AppFieldType.CHECKBOX,
            wrappers: [AppWrapperType.FORM_FIELD],
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

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
