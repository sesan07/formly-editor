import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { IProperty } from 'src/app/editor/components/property/property.types';

@Injectable({
    providedIn: 'root',
})
export class OtherFieldService extends BaseFieldService<FormlyTemplateOptions> {

    public type: FieldType = FieldType.OTHER;

	public getDefaultConfig(
        formId: string,
        customType?: CustomFieldType,
        parentFieldId?: string
    ): IEditorFormlyField {
        return {
            formId,
            parentFieldId,
            name: 'Other',
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
