import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FieldType, IBaseEditorFormlyField, WrapperType } from '../../form-service/form.types';
import { StyleService } from '../../style-service/style.service';
import { IProperty } from '../../../components/property/property.types';
import { FormlyTemplateOptions } from '@ngx-formly/core';

@Injectable({
    providedIn: 'root',
})
export class OtherFieldService extends BaseFieldService<FormlyTemplateOptions> {

    public name = 'Other';
    public type: FieldType = FieldType.OTHER;

    public getDefaultConfig(formId: string, parentFieldId?: string): IBaseEditorFormlyField {
        return {
            formId,
            parentFieldId,
            name: this.name,
			type: undefined,
            fieldId: this.getNextFieldId(),
            wrappers: [WrapperType.EDITOR],
            templateOptions: {},
            expressionProperties: {},
            fieldProperties: this.getProperties(),
        };
    }

    getProperties(): IProperty[] {
        return [
            ...this._getSharedProperties(),
            ...this._getWrapperProperties([]),
        ];
    }
}
