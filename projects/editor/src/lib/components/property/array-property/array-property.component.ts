import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, TrackByFunction } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyService } from '../property.service';
import { IProperty, PropertyType, PropertyValueChangeType } from '../property.types';
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
	public addButtonPadding: number;

	public get hasOptions(): boolean {
		return this.property.isDeletable || this.property.canAdd;
	};

	public childProperties: IProperty[];

	protected propertyname = 'Array';

	constructor(public propertyService: PropertyService, renderer: Renderer2, elementRef: ElementRef) { super(renderer, elementRef); }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes.property) {
            this._populateChildrenFromTarget();
        }
        if (changes.treeLevel) {
            this.addButtonPadding = this.iconSize * (this.treeLevel + 2);
        }
    }

	onAddChild(): void {
        let childValue: unknown;
		switch (this.property.childProperty.type) {
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
				childValue = '';
				break;
			default:
				throw new Error(`Array property does not support adding ${this.property.childProperty.type}`);
		}

        const childPropertyClone: IProperty = this._getChildPropertyClone(this.childProperties.length);
		this.childProperties.push(childPropertyClone);
		this.isExpanded = true;
		this.onValueChanged({
            type: PropertyValueChangeType.ADD,
            path: this.getChildPath(childPropertyClone.key),
            value: childValue
        });
	}

	onRemoveChild(index: number): void {
		const child: IProperty = this.childProperties[index];

		this.childProperties.splice(index, 1);
        this._updateChildrenKeys();
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

	private _updateChildrenKeys(): void {
		this.childProperties.forEach((child, index) => child.key = index);
	}

	private _populateChildrenFromTarget() {
		this.childProperties = [];

		this.target.forEach((_, index) => {
			const childPropertyClone: IProperty = this._getChildPropertyClone(index);
			this.childProperties.push(childPropertyClone);
		});
	}

    private _getChildPropertyClone(index: number): IProperty {
        const property: IProperty = cloneDeep(this.property.childProperty);
        property.key = index;
        property.isKeyEditable = false;
        return property;
    }
}
