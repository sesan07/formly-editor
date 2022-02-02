import { Injectable } from '@angular/core';
import { BaseFieldService } from '../base-field.service';
import { IProperty, PropertyType } from 'src/app/editor/components/property/property.types';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { CustomFieldType, FieldType, IEditorFormlyField, WrapperType } from '../field.types';
import { IChipListProperty } from 'src/app/editor/components/property/chip-list-property/chip-list-property.types';
import { IObjectProperty } from 'src/app/editor/components/property/object-property/object-property.types';

@Injectable({
    providedIn: 'root',
})
export class FormlyGroupService extends BaseFieldService<FormlyTemplateOptions> {

    public type: FieldType = FieldType.FORMLY_GROUP;
	protected defaultName = 'Formly Group';

	public getDefaultConfig(
        formId: string,
        customType?: CustomFieldType,
        parentFieldId?: string
    ): IEditorFormlyField {

        const config: IEditorFormlyField = {
            formId,
            parentFieldId,
			name: this.defaultName,
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

        switch (customType) {
            case CustomFieldType.CARD:
                config.name = 'Card';
                config.customType = customType;
                config.wrappers.push(WrapperType.CARD);
        }

        return config;
    }

    getProperties(): IProperty[] {
        return [
            ...this._getSharedProperties(),
            this._getTemplateOptionsProperty([], [WrapperType.CARD]),
			this._getWrapperProperty([WrapperType.CARD])
        ];
    }
}
