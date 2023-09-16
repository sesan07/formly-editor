import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { BaseFieldService, IProperty } from '@sesan07/ngx-formly-editor';

import { IFormlyField, AppWrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class OtherFieldService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultConfig(): IFormlyField {
        return {
            type: undefined,
        };
    }

    protected override _getFieldProperties(): IProperty[] {
        return [];
    }

    protected override _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): AppWrapperType[] {
        return [];
    }
}
