import { Injectable } from '@angular/core';
import { BaseFieldService, IBaseFormlyField, IEditorFieldService, IProperty } from '@sesan07/ngx-formly-editor';

import { CheckboxService } from './checkbox/checkbox.service';
import { AppFieldType } from './field.types';
import { FormlyGroupService } from './formly-group/formly-group.service';
import { InputService } from './input/input.service';
import { OtherFieldService } from './other/other-field.service';
import { RadioService } from './radio/radio.service';
import { RepeatingSectionService } from './repeating-section/repeating-section.service';
import { SelectService } from './select/select.service';
import { TextareaService } from './textarea/textarea.service';
import { FormlyConfig } from '@ngx-formly/core';

@Injectable({
    providedIn: 'root',
})
export class FieldService implements IEditorFieldService {
    extensionMap: Record<string, string | undefined> = {};

    constructor(
        private _formlyConfig: FormlyConfig,
        private _checkboxService: CheckboxService,
        private _formlyGroupService: FormlyGroupService,
        private _inputService: InputService,
        private _otherFieldService: OtherFieldService,
        private _radioService: RadioService,
        private _repeatingSectionService: RepeatingSectionService,
        private _selectService: SelectService,
        private _textareaFieldService: TextareaService
    ) {
        Object.values(this._formlyConfig.types).forEach(
            type => (this.extensionMap[type.name] = this._formlyConfig.getType(type.name).extends ?? undefined)
        );
    }

    getDefaultField(type: string): IBaseFormlyField {
        return this._getFieldService(this.extensionMap[type] ?? type).getDefaultConfig(type);
    }

    getProperties(type: string): IProperty[] {
        return this._getFieldService(this.extensionMap[type] ?? type).getProperties(type);
    }

    private _getFieldService(type: string): BaseFieldService<any> {
        switch (type) {
            case AppFieldType.CHECKBOX:
                return this._checkboxService;
            case AppFieldType.FORMLY_GROUP:
                return this._formlyGroupService;
            case AppFieldType.INPUT:
                return this._inputService;
            case AppFieldType.OTHER:
                return this._otherFieldService;
            case AppFieldType.RADIO:
                return this._radioService;
            case AppFieldType.REPEATING_SECTION:
                return this._repeatingSectionService;
            case AppFieldType.SELECT:
                return this._selectService;
            case AppFieldType.TEXTAREA:
                return this._textareaFieldService;
            default:
                console.warn(`Unknown formly type: '${type}', treating as 'other' type`);
                return this._otherFieldService;
        }
    }
}
