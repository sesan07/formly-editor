import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, TrackByFunction } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BasePropertyDirective } from '../base-property.component';
import { PropertyService } from '../property.service';
import { IProperty, PropertyType } from '../property.types';
import { IArrayProperty } from './array-property.types';

@Component({
    selector: 'lib-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
})
export class ArrayPropertyComponent extends BasePropertyDirective implements OnChanges {
	@Input() property: IArrayProperty;
	@Input() isRoot: boolean;

	public propertyType: typeof PropertyType = PropertyType;

    public childrenTarget: any[];
	public isExpanded: boolean;

	public get hasOptions(): boolean {
		return this.property.isRemovable || this.property.canAdd;
	};

	public childProperties: IProperty[];

	protected propertyname = 'Array';

	constructor(public propertyService: PropertyService) { super(); }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.target) {
            this.childrenTarget = this.isRoot ? this.target : this.target[this.property.key];
        }

        if (changes.property) {
            this._populateChildrenFromTarget();
        }
    }

	onAddChild(): void {
        const childProperty: IProperty = this._getChildPropertyClone(this.childProperties.length);
		this.childProperties.push(childProperty);
		this.isExpanded = true;

        const childValue: any = this.propertyService.getDefaultPropertyValue(this.property.childProperty.type);
        this.addValue(childProperty.key, childValue);
	}

	onRemoveChild(index: number): void {
		const childProperty: IProperty = this.childProperties[index];
		this.childProperties.splice(index, 1);
        this._updateChildrenKeys();

        this.removeValue(childProperty.key);
	}

	onKeyClicked(event: MouseEvent): void {
        if (this.property.isKeyEditable) {
            event.stopPropagation();
        }
	}

    trackPropertyByKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

	private _updateChildrenKeys(): void {
		this.childProperties.forEach((child, index) => child.key = index);
	}

	private _populateChildrenFromTarget() {
		this.childProperties = [];

		this.childrenTarget.forEach((_, index) => {
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
