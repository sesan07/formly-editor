import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { PropertyService } from './property.service';
import { IProperty, PropertyType } from './property.types';

@Component({
	selector: 'lib-property',
    templateUrl: './property.component.html',
	styleUrls: ['./property.component.scss'],
})
export class PropertyComponent {
	@Input() treeLevel = 0;
	@Input() target: Record<string, any> | any[];
	@Input() property: IProperty;
	@Input() isSimplified: boolean;
	@Input() isRoot: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public targetChanged: EventEmitter<void> = new EventEmitter();

	public propertyType: typeof PropertyType = PropertyType;

    constructor(public element: ElementRef, public propertyService: PropertyService) {}

	onKeyChanged(newKey: string): void {
        const value: any = this.target[this.property.key];
        delete this.target[this.property.key];
        this.target[newKey] = value;
        this.property.key = newKey;
        this.targetChanged.emit();
	}
}
