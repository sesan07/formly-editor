import { Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, Output, Renderer2, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyService } from '../property.service';
import { IProperty, PropertyType } from '../property.types';
import { IObjectProperty } from './object-property.types';

@Component({
	selector: 'lib-object-property',
	templateUrl: './object-property.component.html',
	styleUrls: ['./object-property.component.scss'],
})
export class ObjectPropertyComponent extends BasePropertyComponent implements OnChanges {
	@Input() property: IObjectProperty;



	public propertyType: typeof PropertyType = PropertyType;
	public isExpanded: boolean;

	public propertyTypes: PropertyType[] = Object.values(PropertyType);
	public get hasOptions(): boolean {
		return this.property?.isDeletable || this.property?.addOptions?.length > 0;
	};

	protected propertyname = 'Object';

	constructor(public propertyService: PropertyService, renderer: Renderer2, elementRef: ElementRef) { super(renderer, elementRef); }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.property?.currentValue?.populateChildrenFromTarget) {
			this._populateChildrenFromTarget();
		}
	}

	onAddChild(type: PropertyType, arrayType?: PropertyType): void {
		const childProperty: IProperty = this.propertyService.getDefaultProperty(type, undefined,  arrayType);

		switch (childProperty.type) {
			case PropertyType.ARRAY:
				this.target[childProperty.key] = [];
				break;
			case PropertyType.BOOLEAN:
				this.target[childProperty.key] = false;
				break;
			case PropertyType.OBJECT:
				this.target[childProperty.key] = {};
				break;
			case PropertyType.NUMBER:
				this.target[childProperty.key] = 0;
				break;
			case PropertyType.TEXT:
				this.target[childProperty.key] = '';
				break;
			default:
				throw new Error(`Object property does not support adding ${type}`);
		}

		this.property.childProperties.push(childProperty);
		this.isExpanded = true;
		this.onValueChanged();
	}

	onRemoveChild(index: number): void {
		const child: IProperty = this.property.childProperties[index];

		delete this.target[child.key];
		this.property.childProperties.splice(index, 1);
		this.onValueChanged();
	}

	onKeyChanged(newKey: string, property: IProperty): void {
		const tempValue: any = this.target[property.key];
		delete this.target[property.key];
		this.target[newKey] = tempValue;
		property.key = newKey;
		this.onValueChanged();
	}

	private _populateChildrenFromTarget() {
		Object.entries(this.target).forEach(([key, value]) => {
			// Check if property alreay exists for key
			if (this.property.childProperties.some(p => p.key === key)) {
				return;
			}

			const childProperty = this.propertyService.getDefaultPropertyFromValue(value, key);
			if (childProperty) {
				this.property.childProperties.push(childProperty);
			}
		});
	}
}
