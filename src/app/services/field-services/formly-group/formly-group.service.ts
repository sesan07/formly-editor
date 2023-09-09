import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { BaseFieldService, IBaseFormlyField, IProperty, PropertyType } from 'editor';

import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType, sourceField?: IBaseFormlyField): IFormlyField {
        const config: IFormlyField = {
            type: FieldType.FORMLY_GROUP,
            fieldGroup: [],
        };

        if (sourceField?.wrappers?.includes(CustomFieldType.CARD)) {
            customType = customType || CustomFieldType.CARD;
        }

        switch (customType) {
            case CustomFieldType.CARD:
                config.name = 'Card';
                config.customType = customType;
                config.wrappers = [WrapperType.CARD];
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

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.CARD];
    }
}
