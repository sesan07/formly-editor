import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { BaseFieldService, IBaseFormlyField, IProperty, PropertyType } from 'editor';

import { AppCustomFieldType, AppFieldType, IFormlyField, AppWrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultConfig(customType?: AppCustomFieldType, sourceField?: IBaseFormlyField): IFormlyField {
        const config: IFormlyField = {
            type: AppFieldType.FORMLY_GROUP,
            fieldGroup: [],
        };

        if (sourceField?.wrappers?.includes(AppCustomFieldType.CARD)) {
            customType = customType || AppCustomFieldType.CARD;
        }

        switch (customType) {
            case AppCustomFieldType.CARD:
                config.name = 'Card';
                config.customType = customType;
                config.wrappers = [AppWrapperType.CARD];
        }

        return config;
    }
    protected override _getFieldTemplateOptions(): IProperty[] {
        return [];
    }

    protected override _getWrapperTemplateOptions(): IProperty[] {
        return [
            {
                name: 'Card Title - Card Wrapper',
                key: 'templateOptions.cardTitle',
                type: PropertyType.TEXT,
            },
        ];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [AppWrapperType.CARD];
    }
}
