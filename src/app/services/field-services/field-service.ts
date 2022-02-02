import { Injectable } from '@angular/core';
import { IProperty } from 'src/app/editor/components/property/property.types';
import { EditorFieldConfig } from 'src/app/editor/editor.types';
import { IBaseEditorFormlyField, IFieldService } from 'src/app/editor/services/form-service/form.types';
import { BaseFieldService } from './base-field.service';
import { CheckboxService } from './checkbox/checkbox.service';
import { FieldType } from './field.types';
import { FormlyGroupService } from './formly-group/formly-group.service';
import { InputService } from './input/input.service';
import { OtherFieldService } from './other/other-field.service';
import { RadioService } from './radio/radio.service';
import { SelectService } from './select/select.service';
import { TextareaService } from './textarea/textarea.service';

@Injectable({
    providedIn: 'root'
})
export class FieldService implements IFieldService {

    constructor(private _checkboxService: CheckboxService,
        private _formlyGroupService: FormlyGroupService,
        private _inputService: InputService,
        private _otherFieldService: OtherFieldService,
        private _radioService: RadioService,
        private _selectService: SelectService,
        private _textareaFieldService: TextareaService,
    ) { }

    getDefaultConfig(type: string, formId: string, customType?: string, parentFieldId?: string): IBaseEditorFormlyField {
        const fieldService: BaseFieldService<any> = this._getFieldService(type, customType);
        return fieldService.getDefaultConfig(formId, parentFieldId);
    }

    getProperties(type: string, customType?: string): IProperty[] {
        const fieldService: BaseFieldService<any> = this._getFieldService(type, customType);
        return fieldService.getProperties();
    }

    getNextFieldId(type: string, customType?: string): string {
        const fieldService: BaseFieldService<any> = this._getFieldService(type, customType);
        return fieldService.getNextFieldId();
    }

    private _getFieldService(type: string, customType?: string): BaseFieldService<any> {
        // TODO check for customType to get correct service
        switch (type) {
            case FieldType.CHECKBOX: return this._checkboxService;
            case FieldType.FORMLY_GROUP: return this._formlyGroupService;
            case FieldType.INPUT: return this._inputService;
            case FieldType.OTHER: return this._otherFieldService;
            case FieldType.RADIO: return this._radioService;
            case FieldType.SELECT: return this._selectService;
            case FieldType.TEXTAREA: return this._textareaFieldService;
            default:
				console.warn(`Unknown formly type: '${type}', treating as 'other' type`);
				return this._otherFieldService;
        }
    }
}