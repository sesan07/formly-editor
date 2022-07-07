import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyDirective } from '../base-property.component';
import { IInputProperty } from './input-property.types';

@Component({
	selector: 'lib-input-property',
	templateUrl: './input-property.component.html',
	styleUrls: ['./input-property.component.scss'],
})
export class InputPropertyComponent extends BasePropertyDirective implements OnChanges, OnInit {
	@Input() property: IInputProperty;

	public type: string;
    public formControl: FormControl;

	public get hasOptions(): boolean {
		return this.property.isRemovable;
	};

	protected propertyname = 'Input';

    ngOnInit(): void {
        this.formControl = new FormControl(this.target[this.property.key]);
        this.formControl.valueChanges.subscribe(val => {
            this._updateValue(val);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.property) {
            this.type =  this.property.type.toLowerCase();

            if (this.formControl) {
                this.formControl.setValue(this.target[this.property.key] ?? '', { emitEvent: false });
            }
        }
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

        this.modifyValue(this.property.key, newValue);
    }
}
