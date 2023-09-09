import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { BaseFieldService, IProperty } from 'editor';

import { IFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class OtherFieldService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultConfig(): IFormlyField {
        return {
            type: undefined,
        };
    }

    protected override _getFieldTemplateOptions(): IProperty[] {
        return [];
    }

    protected override _getWrapperTemplateOptions(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [];
    }
}
