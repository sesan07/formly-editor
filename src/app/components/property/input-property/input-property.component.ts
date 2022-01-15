import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyType } from '../property.types';
import { IInputProperty } from './input-property.types';

@Component({
	selector: 'app-input-property',
	templateUrl: './input-property.component.html',
	styleUrls: ['./input-property.component.scss'],
})
export class InputPropertyComponent extends BasePropertyComponent {
	@Input() property: IInputProperty;
	@Input() type: PropertyType.TEXT | PropertyType.NUMBER = PropertyType.TEXT;

	@Output() public valueChanged: EventEmitter<void> = new EventEmitter();

	@HostBinding('class.highlighted') get propertyHighlighted() { return this.isPropertyHighlighted; }

	public isPropertyHighlighted: boolean;
	public get hasOptions(): boolean {
		return this.property.isDeletable;
	};

	protected propertyname = 'Input';

	onValueChanged(): void {
		this.valueChanged.emit();
	}
}
