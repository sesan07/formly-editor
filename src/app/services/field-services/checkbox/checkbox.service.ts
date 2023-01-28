import { Injectable } from '@angular/core';
import { IProperty, PropertyType } from 'editor';

import { BaseFieldService } from '../base-field.service';
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

    protected _getTOChildProperties(): IProperty[] {
        return [
            {
                name: 'Label',
                key: 'templateOptions.label',
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
                name: 'Required',
                key: 'templateOptions.required',
                type: PropertyType.BOOLEAN,
                isSimple: true,
            },
            {
                name: 'Pattern',
                key: 'templateOptions.pattern',
                type: PropertyType.TEXT,
                isSimple: true,
            },
        ];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.FORM_FIELD];
    }
}
