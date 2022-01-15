import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { BasePropertyComponent } from '../base-property.component';
import { IBooleanProperty } from './boolean-property.types';

@Component({
    selector: 'app-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
})
export class BooleanPropertyComponent extends BasePropertyComponent {
	@Input() property: IBooleanProperty;

    @Output() public valueChanged: EventEmitter<void> = new EventEmitter();

	@HostBinding('class.highlighted') get propertyHighlighted() { return this.isPropertyHighlighted; }

	public isPropertyHighlighted: boolean;
	public get hasOptions(): boolean {
		return this.property.isDeletable;
	};

	protected propertyname = 'Boolean';

	onValueChanged(): void {
		this.valueChanged.emit();
	}
}
