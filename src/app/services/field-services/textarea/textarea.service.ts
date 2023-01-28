import { Injectable } from '@angular/core';
import { IProperty, PropertyType } from 'editor';

import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { ITextareaTemplateOptions } from './textarea.types';

@Injectable({
    providedIn: 'root',
})
export class TextareaService extends BaseFieldService<ITextareaTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType): IFormlyField<ITextareaTemplateOptions> {
        return {
            type: FieldType.TEXTAREA,
            wrappers: [WrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
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
                name: 'Required',
                key: 'templateOptions.required',
                type: PropertyType.BOOLEAN,
                isSimple: true,
            },
        ];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.FORM_FIELD];
    }
}
