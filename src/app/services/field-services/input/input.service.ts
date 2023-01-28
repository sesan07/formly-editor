import { Injectable } from '@angular/core';
import { IProperty, PropertyType } from 'editor';

import { BaseFieldService } from '../base-field.service';
import { IInputTemplateOptions } from './input.types';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType): IFormlyField<IInputTemplateOptions> {
        const config: IFormlyField<IInputTemplateOptions> = {
            type: FieldType.INPUT,
            wrappers: [WrapperType.FORM_FIELD],
            templateOptions: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
            },
        };

        switch (customType) {
            case CustomFieldType.NUMBER:
                config.name = 'Number';
                config.customType = customType;
                config.templateOptions.type = 'number';
        }

        return config;
    }

    protected _getTOChildProperties(): IProperty[] {
        return [
            {
                name: 'Type',
                key: 'templateOptions.type',
                type: PropertyType.TEXT,
                isSimple: true,
            },
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
