import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyType } from '../property.types';
import { IInputProperty } from './input-property.types';

@Component({
	selector: 'lib-input-property',
	templateUrl: './input-property.component.html',
	styleUrls: ['./input-property.component.scss'],
})
export class InputPropertyComponent extends BasePropertyComponent implements OnChanges, OnInit {
	@Input() property: IInputProperty;
	@Input() type: PropertyType.TEXT | PropertyType.NUMBER = PropertyType.TEXT;

	public get hasOptions(): boolean {
		return this.property.isDeletable;
	};

	protected propertyname = 'Input';
}
