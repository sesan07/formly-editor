import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyComponent } from '../base-property.component';
import { IInputProperty } from './input-property.types';

@Component({
	selector: 'lib-input-property',
	templateUrl: './input-property.component.html',
	styleUrls: ['./input-property.component.scss'],
})
export class InputPropertyComponent extends BasePropertyComponent implements OnChanges, OnInit {
	@Input() property: IInputProperty;

	public type: string;
    public formControl: FormControl;

	public get hasOptions(): boolean {
		return this.property.isDeletable;
	};

	protected propertyname = 'Input';

    ngOnInit(): void {
        super.ngOnInit();
        this.formControl = new FormControl(this.target[this.property.key]);
        this.formControl.valueChanges.subscribe(val => {
            this._updateValue(val);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        if (changes.property) {
            this.type =  this.property.type.toLowerCase();

            if (this.formControl) {
                this.formControl.setValue(this.target[this.property.key] ?? '', { emitEvent: false });
            }
        }
    }

    private _updateValue(value: string): void {
        if (value === '') {
            this.target[this.property.key] = null;
        } else if (this.property.outputRawValue) {
            if (value.match('\'.*\'')) {  // enforced string (when the value is wrapped in single quotes)
                this.target[this.property.key] = value.match('(?<=\').*(?=\')')[0];
            } else if (!isNaN(Number(value))) {  // Number
                this.target[this.property.key] = Number(value);
            } else if (value === 'true' || value === 'false') {  // Boolean
                this.target[this.property.key] = value === 'true';
            } else {  // string
                this.target[this.property.key] = value;
            }
        } else {
            this.target[this.property.key] = value;
        }

        this.onValueChanged();
    }
}
