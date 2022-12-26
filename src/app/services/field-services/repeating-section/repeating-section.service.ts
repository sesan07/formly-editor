import { Injectable } from '@angular/core';
import { IProperty, PropertyType } from 'editor';

import { BaseFieldService } from '../base-field.service';
import { IRepeatingSectionTemplateOptions } from './repeating-section.types';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class RepeatingSectionService extends BaseFieldService<IRepeatingSectionTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType): IFormlyField<IRepeatingSectionTemplateOptions> {
        return {
            key: 'tempKey',
            type: FieldType.REPEATING_SECTION,
            templateOptions: {
                addText: 'Add Section',
            },
            fieldArray: {
                fieldGroup: [],
            },
        };
    }

    protected _getTOChildProperties(): IProperty[] {
        return [
            {
                name: 'Add Text',
                key: 'addText',
                type: PropertyType.TEXT,
                isSimple: true,
            },
        ];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [];
    }
}
