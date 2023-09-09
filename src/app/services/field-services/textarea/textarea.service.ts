import { Injectable } from '@angular/core';
import { BaseFieldService, IProperty, PropertyType } from 'editor';

import { AppCustomFieldType, AppFieldType, IFormlyField, AppWrapperType } from '../field.types';
import { ITextareaTemplateOptions } from './textarea.types';

@Injectable({
    providedIn: 'root',
})
export class TextareaService extends BaseFieldService<ITextareaTemplateOptions> {
    public getDefaultConfig(customType?: AppCustomFieldType): IFormlyField<ITextareaTemplateOptions> {
        return {
            type: AppFieldType.TEXTAREA,
            wrappers: [AppWrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
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
        ];
    }

    protected override _getWrapperTemplateOptions(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.FORM_FIELD];
    }
}
