import { Injectable } from '@angular/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { BaseFieldService } from '../base-field.service';
import { IBaseFormlyField } from '../../editor.types';
import { IProperty } from '../../property/property.types';

@Injectable()
export class GenericFieldService extends BaseFieldService<FormlyTemplateOptions> {
    public getDefaultField(): IBaseFormlyField<FormlyTemplateOptions> {
        return { type: undefined };
    }

    protected override _getFieldProperties(): IProperty[] {
        return [];
    }

    protected override _getWrapperProperties(): IProperty[] {
        return [];
    }

    protected _getWrapperTypes(): string[] {
        return [];
    }
}
