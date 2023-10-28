import { Injectable } from '@angular/core';
import { FormlyFieldProps } from '@ngx-formly/core';
import { BaseFieldService, IProperty } from '@sesan07/ngx-formly-editor';

import { AppFieldType, AppWrapperType, IFormlyField } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyFieldProps> {
    public getDefaultField(type: AppFieldType): IFormlyField {
        return {
            type,
            fieldGroup: [],
        };
    }
    protected _getFieldProperties(type: AppFieldType): IProperty[] {
        return [];
    }

    protected _getWrapperProperties(type: AppFieldType): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(type: AppFieldType): AppWrapperType[] {
        return [];
    }
}
