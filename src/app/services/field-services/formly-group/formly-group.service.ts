import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { CustomFieldType, FieldType, IFormlyField, WrapperType } from '../field.types';
import { IProperty } from 'editor';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {

	public getDefaultConfig(customType?: CustomFieldType): IFormlyField {
        const config: IFormlyField = {
			type: FieldType.FORMLY_GROUP,
            wrappers: [],
            templateOptions: {},
            fieldGroup: [],
            expressionProperties: {},
		};

        switch (customType) {
            case CustomFieldType.CARD:
                config.name = 'Card';
                config.customType = customType;
                config.wrappers.push(WrapperType.CARD);
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
