import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { IProperty } from 'editor';

import { BaseFieldService } from '../base-field.service';
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

    protected _getTOChildProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): WrapperType[] {
        return [];
    }
}
