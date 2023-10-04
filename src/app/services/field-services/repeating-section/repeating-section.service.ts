import { Injectable } from '@angular/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

// import { BaseFieldService } from '../base-field.service';
import { AppFieldType, AppWrapperType, IFormlyField } from '../field.types';
import { IRepeatingSectionTemplateOptions } from './repeating-section.types';

@Injectable({
    providedIn: 'root',
})
export class RepeatingSectionService extends BaseFieldService<IRepeatingSectionTemplateOptions> {
    public getDefaultField(type?: AppFieldType): IFormlyField<IRepeatingSectionTemplateOptions> {
        return {
            // key: 'tempKey',
            type,
            templateOptions: {
                addText: 'Add Section',
            },
            fieldArray: {
                fieldGroup: [],
            },
        };
    }

    protected _getFieldProperties(): IProperty[] {
        return [
            {
                name: 'Add Text',
                key: 'addText',
                type: PropertyType.TEXT,
            },
        ];
    }

    protected _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [];
    }
}
