import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyDirective } from '../base-property.component';
import { IInputProperty } from './input-property.types';

@Component({
	selector: 'editor-input-property',
	templateUrl: './input-property.component.html',
	styleUrls: ['./input-property.component.scss'],
})
export class InputPropertyComponent extends BasePropertyDirective<IInputProperty> {
    public formControl: FormControl;

	public get hasOptions(): boolean {
		return this.property.isRemovable;
	};

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.formControl = new FormControl(this._getPropertyValue(''));
            this.formControl.valueChanges.subscribe(val => this._updateValue(val));
        }

        this.formControl.setValue(this._getPropertyValue(''), { emitEvent: false });
    }

    private _updateValue(value: string): void {
        let newValue: string | number | boolean;
        if (value === '') {
            newValue = null;
        } else if (this.property.outputRawValue) {
            if (value.match('\'.*\'')) {  // enforced string (when the value is wrapped in single quotes)
                newValue = value.match('(?<=\').*(?=\')')[0];
            } else if (!isNaN(Number(value))) {  // Number
                newValue = Number(value);
            } else if (value === 'true' || value === 'false') {  // Boolean
                newValue = value === 'true';
            } else {  // string
                newValue = value;
            }
        } else {
            newValue = value;
        }

        this._modifyValue(newValue);
    }
}
