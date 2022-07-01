import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyComponent } from '../base-property.component';
import { IBooleanProperty } from './boolean-property.types';

@Component({
    selector: 'lib-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
})
export class BooleanPropertyComponent extends BasePropertyComponent implements OnInit {
	@Input() property: IBooleanProperty;

    public formControl: FormControl;

	public get hasOptions(): boolean {
		return this.property.isRemovable;
	};

	protected propertyname = 'Boolean';

    ngOnInit(): void {
        this.formControl = new FormControl(this.target[this.property.key]);
        this.formControl.valueChanges.subscribe(val => this.modifyValue(this.property.key, val));
    }
}
