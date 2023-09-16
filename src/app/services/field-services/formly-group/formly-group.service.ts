import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { AppFieldType, IFormlyField, AppWrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultConfig(type: AppFieldType): IFormlyField {
        const config: IFormlyField = {
            type,
            fieldGroup: [],
        };

        return config;
    }
    protected override _getFieldProperties(type: AppFieldType): IProperty[] {
        return type === AppFieldType.FORMLY_GROUP_CARD
            ? [
                  {
                      name: 'Card Title',
                      key: 'templateOptions.cardTitle',
                      type: PropertyType.TEXT,
                  },
              ]
            : [];
    }

    protected override _getWrapperProperties(type: AppFieldType): IProperty[] {
        return type === AppFieldType.FORMLY_GROUP
            ? [
                  {
                      name: 'Card Title',
                      key: 'templateOptions.cardTitle',
                      type: PropertyType.TEXT,
                  },
              ]
            : [];
    }

    protected _getWrapperTypes(type: AppFieldType): AppWrapperType[] {
        return type === AppFieldType.FORMLY_GROUP ? [AppWrapperType.CARD] : [];
    }
}
