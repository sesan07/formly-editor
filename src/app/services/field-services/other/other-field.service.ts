import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { CustomFieldType, IFormlyField, WrapperType } from '../field.types';
import { IProperty } from 'editor';

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
