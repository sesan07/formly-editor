import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { BasePropertyComponent } from '../base-property.component';
import { IBooleanProperty } from './boolean-property.types';

@Component({
    selector: 'lib-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
})
export class BooleanPropertyComponent extends BasePropertyComponent {
	@Input() property: IBooleanProperty;




	public get hasOptions(): boolean {
		return this.property.isDeletable;
	};

	protected propertyname = 'Boolean';
}
