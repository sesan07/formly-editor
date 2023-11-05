import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType } from '../../../field-services/field.types';
import { IRepeatingSectionProps } from './repeating-section.types';

@Injectable({
    providedIn: 'root',
})
export class RepeatingSectionService extends BaseFieldService<IRepeatingSectionProps> {
    public getDefaultField(type?: AppFieldType): FormlyFieldConfig<IRepeatingSectionProps> {
        return {
            type,
            templateOptions: {
                addText: 'Add Section',
            },
            fieldArray: {
                fieldGroup: [],
            },
        };
    }

    protected override _getFieldProperties(): IProperty[] {
        return [
            {
                name: 'Add Text',
                key: 'props.addText',
                type: PropertyType.TEXT,
            },
        ];
    }

    protected override _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected override _getWrapperTypes(): AppWrapperType[] {
        return [];
    }
}
