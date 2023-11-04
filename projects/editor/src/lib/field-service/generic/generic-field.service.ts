import { Injectable } from '@angular/core';
import { FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';

import { BaseFieldService } from '../base-field.service';
import { IProperty } from '../../property/property.types';

@Injectable()
export class GenericFieldService extends BaseFieldService<FormlyFieldProps> {
    public getDefaultField(): FormlyFieldConfig {
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
