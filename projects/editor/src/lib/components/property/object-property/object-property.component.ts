import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, TrackByFunction } from '@angular/core';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyService } from '../property.service';
import { IProperty, PropertyValueChangeType, PropertyType } from '../property.types';
import { IObjectProperty } from './object-property.types';

@Component({
	selector: 'lib-object-property',
	templateUrl: './object-property.component.html',
	styleUrls: ['./object-property.component.scss'],
})
export class ObjectPropertyComponent extends BasePropertyComponent implements OnChanges {
	@Input() property: IObjectProperty;
	@Input() isExpanded: boolean;

	public propertyType: typeof PropertyType = PropertyType;
	public addButtonPadding: number;

	public propertyTypes: PropertyType[] = Object.values(PropertyType);
	public get hasOptions(): boolean {
		return this.property.isDeletable || this.property.addOptions?.length > 0;
	};
    public get canAdd(): boolean { return this.property.addOptions?.length > 0; }

	protected propertyname = 'Object';

	constructor(public propertyService: PropertyService, renderer: Renderer2, elementRef: ElementRef) { super(renderer, elementRef); }

	ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
		if (changes.property?.currentValue?.populateChildrenFromTarget) {
			this._populateChildrenFromTarget();
		}
        if (changes.treeLevel) {
            this.addButtonPadding = this.iconSize * (this.treeLevel + 2);
        }
	}

	onAddChild(type: PropertyType, arrayType?: PropertyType): void {
		const childProperty: IProperty = this.propertyService.getDefaultProperty(type, undefined,  arrayType);

        let childValue: unknown;
		switch (childProperty.type) {
			case PropertyType.ARRAY:
				childValue = [];
				break;
			case PropertyType.BOOLEAN:
				childValue = false;
				break;
			case PropertyType.OBJECT:
				childValue = {};
				break;
			case PropertyType.NUMBER:
				childValue = 0;
				break;
			case PropertyType.TEXT:
			case PropertyType.TEXTAREA:
				childValue = '';
				break;
			default:
				throw new Error(`Object property does not support adding ${type}`);
		}

		this.property.childProperties.push(childProperty);
		this.isExpanded = true;
		this.onValueChanged({
            type: PropertyValueChangeType.ADD,
            path: this.getChildPath(childProperty.key),
            value: childValue
        });
	}

	onRemoveChild(index: number): void {
		const child: IProperty = this.property.childProperties[index];

		this.property.childProperties.splice(index, 1);
		this.onValueChanged({
            type: PropertyValueChangeType.REMOVE,
            path: this.getChildPath(child.key),
            value: null
        });
	}

    trackPropertyByKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

    getChildPath(key: string | number): string {
        return (this.path ? this.path + '.' : '') + key;
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
