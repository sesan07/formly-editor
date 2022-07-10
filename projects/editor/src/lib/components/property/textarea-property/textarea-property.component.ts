import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyDirective } from '../base-property.component';
import { ITextareaProperty } from './textarea-property.types';

@Component({
    selector: 'editor-textarea-property',
    templateUrl: './textarea-property.component.html',
    styleUrls: ['./textarea-property.component.scss']
})
export class TextareaPropertyComponent extends BasePropertyDirective<ITextareaProperty> {
    public formControl: FormControl;

    public get hasOptions(): boolean {
        return this.property.isRemovable;
    };

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.formControl = new FormControl(this._getPropertyValue(''));
            this.formControl.valueChanges.subscribe(val => this._modifyValue(val));
        }

        this.formControl.setValue(this._getPropertyValue(''), { emitEvent: false });
    }
}
