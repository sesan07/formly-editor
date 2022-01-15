import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FieldType, IBaseEditorFormlyField, WrapperType } from '../../form-service/form.types';
import { StyleService } from '../../style-service/style.service';
import { IProperty } from 'src/app/components/property/property.types';
import { FormlyTemplateOptions } from '@ngx-formly/core';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {

    public name = 'Formly Group';
    public type: FieldType = FieldType.FORMLY_GROUP;

    public getDefaultConfig(formId: string, parentFieldId?: string): IBaseEditorFormlyField {
        return {
            formId,
            parentFieldId,
            name: this.name,
			type: this.type,
            fieldId: this.getNextFieldId(),
            wrappers: [WrapperType.EDITOR],
            templateOptions: {},
            fieldGroup: [],
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
