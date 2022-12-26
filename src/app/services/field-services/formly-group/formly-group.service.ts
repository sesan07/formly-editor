import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IProperty } from 'editor';

import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultConfig(customType?: CustomFieldType): IFormlyField {
        const config: IFormlyField = {
            type: FieldType.FORMLY_GROUP,
            fieldGroup: [],
        };

        switch (customType) {
            case CustomFieldType.CARD:
                config.name = 'Card';
                config.customType = customType;
                config.wrappers = [WrapperType.CARD];
        }

        return config;
    }

    protected _getTOChildProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [WrapperType.CARD];
    }
}
