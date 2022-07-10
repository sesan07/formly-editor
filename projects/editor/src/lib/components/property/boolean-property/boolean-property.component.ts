import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyDirective } from '../base-property.component';
import { IBooleanProperty } from './boolean-property.types';

@Component({
    selector: 'editor-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
})
export class BooleanPropertyComponent extends BasePropertyDirective<IBooleanProperty> {
    public formControl: FormControl;

	public get hasOptions(): boolean {
		return this.property.isRemovable;
	};

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.formControl = new FormControl(this._getPropertyValue());
            this.formControl.valueChanges.subscribe(val => this._modifyValue(val));
        }

        this.formControl.setValue(this._getPropertyValue(''), { emitEvent: false });
    }
}
