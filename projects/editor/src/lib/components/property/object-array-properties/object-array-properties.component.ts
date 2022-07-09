import { Component, OnChanges, Input, SimpleChanges, TrackByFunction } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BasePropertyDirective } from '../base-property.component';
import { PropertyService } from '../property.service';
import { PropertyType, IProperty } from '../property.types';
import { IArrayProperty } from './array-property.types';
import { IObjectProperty } from './object-property.types';

@Component({
    selector: 'editor-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
})
export class ArrayPropertyComponent extends BasePropertyDirective implements OnChanges {
	@Input() property: IArrayProperty;
	@Input() isRoot: boolean;

	public propertyType: typeof PropertyType = PropertyType;

    public childrenTarget: any[];
	public isExpanded: boolean;

	public childProperties: IProperty[];

	constructor(public propertyService: PropertyService) { super(); }

	public get hasOptions(): boolean {
		return this.property.isRemovable || this.property.canAdd;
	};

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

@Component({
	selector: 'editor-object-property',
	templateUrl: './object-property.component.html',
	styleUrls: ['./object-property.component.scss'],
})
export class ObjectPropertyComponent extends BasePropertyDirective implements OnChanges {
	@Input() property: IObjectProperty;
	@Input() isExpanded: boolean;
	@Input() isRoot: boolean;

	public propertyType: typeof PropertyType = PropertyType;
	public propertyTypes: PropertyType[] = Object.values(PropertyType);

    public childrenTarget: Record<string, any>;

	constructor(public propertyService: PropertyService) { super(); }

    public get canAdd(): boolean { return this.property.addOptions?.length > 0; }
	public get hasOptions(): boolean {
		return this.property.isRemovable || this.canAdd;
	};

	ngOnChanges(changes: SimpleChanges): void {
        if(changes.target) {
            this.childrenTarget = this.isRoot ? this.target : this.target[this.property.key];
        }

		if (changes.property?.currentValue?.populateChildrenFromTarget) {
			this._populateChildrenFromTarget();
		}
	}

	onAddChild(type: PropertyType, arrayType?: PropertyType): void {
		const childProperty: IProperty = this.propertyService.getDefaultProperty(type, undefined,  arrayType);
		this.property.childProperties.push(childProperty);
		this.isExpanded = true;

        const childValue: any = this.propertyService.getDefaultPropertyValue(type);
        this.addValue(childProperty.key, childValue);;
	}

	onRemoveChild(index: number): void {
		const childProperty: IProperty = this.property.childProperties[index];
		this.property.childProperties.splice(index, 1);

        this.removeValue(childProperty.key);
	}

	onKeyClicked(event: MouseEvent): void {
        if (this.property.isKeyEditable) {
            event.stopPropagation();
        }
	}

    trackPropertyByKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

	private _populateChildrenFromTarget() {
		Object.entries(this.childrenTarget).forEach(([key, value]) => {
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
