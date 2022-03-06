import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, TrackByFunction } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyService } from '../property.service';
import { IProperty, PropertyType } from '../property.types';
import { IArrayProperty } from './array-property.types';

@Component({
    selector: 'lib-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
})
export class ArrayPropertyComponent extends BasePropertyComponent implements OnChanges {
	@Input() property: IArrayProperty;
	@Input() target: any[];

	public propertyType: typeof PropertyType = PropertyType;
	public isExpanded: boolean;

	public get hasOptions(): boolean {
		return this.property.isDeletable || this.property.canAdd;
	};

	public childProperties: IProperty[];

	protected propertyname = 'Array';

	constructor(public propertyService: PropertyService, renderer: Renderer2, elementRef: ElementRef) { super(renderer, elementRef); }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes.property) {
            this._updateChildProperties();
        }
    }

	onAddChild(): void {
		switch (this.property.childProperty.type) {
			case PropertyType.BOOLEAN:
				this.target.push(false);
				break;
			case PropertyType.OBJECT:
				this.target.push({});
				break;
			case PropertyType.NUMBER:
				this.target.push(0);
				break;
			case PropertyType.TEXT:
				this.target.push('');
				break;
			default:
				throw new Error(`Array property does not support adding ${this.property.childProperty.type}`);
		}

		this._updateChildProperties();

		this.isExpanded = true;
		this.onValueChanged();
	}

	onRemoveChild(index: number): void {
		this.target.splice(index, 1);
		this.childProperties.splice(index, 1);

        this._updateChildProperties();
        this.onValueChanged();
	}

    trackPropertyByKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

	private _updateChildProperties(): void {
		this.childProperties = [];

		this.target.forEach((_, index) => {
			const childPropertyClone: IProperty = cloneDeep(this.property.childProperty);
			childPropertyClone.key = index;
			childPropertyClone.isKeyEditable = false;
			this.childProperties.push(childPropertyClone);
		});
	}
}
