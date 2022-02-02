import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { IProperty } from 'src/app/editor/components/property/property.types';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {

    public type: FieldType = FieldType.FORMLY_GROUP;

	public getDefaultConfig(
        formId: string,
        customType?: CustomFieldType,
        parentFieldId?: string
    ): IEditorFormlyField {
        return {
            formId,
            parentFieldId,
            name: 'Formly Group',
			type: this.type,
            fieldId: this.getNextFieldId(),
            wrappers: [WrapperType.EDITOR],
            templateOptions: {},
            fieldGroup: [],
            expressionProperties: {},
            fieldProperties: this.getProperties(),
            canHaveChildren: true,
            childrenPath: 'fieldGroup'
        };
    }

    getProperties(): IProperty[] {
        return [
            ...this._getSharedProperties(),
            ...this._getWrapperProperties([]),
        ];
    }
}
