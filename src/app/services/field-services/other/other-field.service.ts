import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { CustomFieldType, IFormlyField } from '../field.types';
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

    getProperties(): IProperty[] {
        return [
            ...this._getSharedProperties(),
            this._getTemplateOptionsProperty([], []),
			this._getWrapperProperty([])
        ];
    }
}
