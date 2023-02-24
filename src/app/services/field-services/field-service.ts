import { Injectable } from '@angular/core';
import { IBaseFormlyField, IFieldService, IProperty } from 'editor';

import { BaseFieldService } from './base-field.service';
import { CheckboxService } from './checkbox/checkbox.service';
import { CustomFieldType, FieldType } from './field.types';
import { FormlyGroupService } from './formly-group/formly-group.service';
import { InputService } from './input/input.service';
import { OtherFieldService } from './other/other-field.service';
import { RadioService } from './radio/radio.service';
import { RepeatingSectionService } from './repeating-section/repeating-section.service';
import { SelectService } from './select/select.service';
import { TextareaService } from './textarea/textarea.service';

@Injectable({
    providedIn: 'root',
})
export class FieldService implements IFieldService {
    constructor(
        private _checkboxService: CheckboxService,
        private _formlyGroupService: FormlyGroupService,
        private _inputService: InputService,
        private _otherFieldService: OtherFieldService,
        private _radioService: RadioService,
        private _repeatingSectionService: RepeatingSectionService,
        private _selectService: SelectService,
        private _textareaFieldService: TextareaService
    ) {}

    getDefaultField(type: FieldType, customType?: CustomFieldType, sourceField?: IBaseFormlyField): IBaseFormlyField {
        const fieldService: BaseFieldService<any> = this._getFieldService(type);
        return fieldService.getDefaultConfig(customType, sourceField);
    }

    getFieldProperties(type: FieldType): IProperty[] {
        const fieldService: BaseFieldService<any> = this._getFieldService(type);
        return fieldService.getProperties();
    }

    private _getFieldService(type: FieldType): BaseFieldService<any> {
        switch (type) {
            case FieldType.CHECKBOX:
                return this._checkboxService;
            case FieldType.FORMLY_GROUP:
                return this._formlyGroupService;
            case FieldType.INPUT:
                return this._inputService;
            case FieldType.OTHER:
                return this._otherFieldService;
            case FieldType.RADIO:
                return this._radioService;
            case FieldType.REPEATING_SECTION:
                return this._repeatingSectionService;
            case FieldType.SELECT:
                return this._selectService;
            case FieldType.TEXTAREA:
                return this._textareaFieldService;
            default:
                console.warn(`Unknown formly type: '${type}', treating as 'other' type`);
                return this._otherFieldService;
        }
    }
}
