import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IProperty } from 'editor';

import { BaseFieldService } from '../base-field.service';
import { CustomFieldType, IFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class OtherFieldService extends BaseFieldService<FormlyTemplateOptions> {

	public getDefaultConfig(customType?: CustomFieldType): IFormlyField {
        return {
			type: undefined,
            wrappers: [],
            templateOptions: {},
            expressionProperties: {},
        };
    }

    protected _getTOChildProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [];
    }
}
