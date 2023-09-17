import { Injectable } from '@angular/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, IFormlyField, AppWrapperType } from '../field.types';
import { ICheckboxTemplateOptions } from './checkbox.types';

@Injectable({
    providedIn: 'root',
})
export class CheckboxService extends BaseFieldService<ICheckboxTemplateOptions> {
    public getDefaultField(type: AppFieldType): IFormlyField<ICheckboxTemplateOptions> {
        return {
            type,
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

    protected override _getFieldProperties(): IProperty[] {
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

    protected override _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
