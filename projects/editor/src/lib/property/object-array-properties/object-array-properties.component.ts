import { Component, Directive, Input, TrackByFunction } from '@angular/core';
import { cloneDeep } from 'lodash-es';

import { BasePropertyDirective } from '../base-property.component';
import { PropertyService } from '../property.service';
import { PropertyType, IProperty, IBaseProperty } from '../property.types';
import { IArrayProperty } from './array-property.types';
import { IObjectProperty } from './object-property.types';

@Directive()
export abstract class ObjectArrayPropertyDirective<P extends IBaseProperty, T> extends BasePropertyDirective<P> {
    @Input() isExpanded: boolean;
    @Input() isRoot: boolean;

    public typeofProperty: typeof PropertyType = PropertyType;
    public childProperties: IProperty[] = [];
    public childrenTarget: T;

    constructor(public propertyService: PropertyService) {
        super();
    }

    public get hasOptions(): boolean {
        return this.property.isRemovable || this.canAdd;
    }

    public abstract get canAdd(): boolean;

    trackPropertyByKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

    protected _onChanged(): void {
        this.childrenTarget = this._getChildrenTarget();
        this._populateChildren();
    }

    protected _getChildrenTarget(): T {
        return this.isRoot ? this.target : this.target[this.property.key];
    }

    protected abstract _populateChildren(): void;
}

@Component({
    selector: 'editor-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
})
export class ArrayPropertyComponent extends ObjectArrayPropertyDirective<IArrayProperty, any[]> {
    constructor(propertyService: PropertyService) {
        super(propertyService);
    }

    public get canAdd(): boolean {
        return this.property.canAdd;
    }

    onAddChild(): void {
        const childProperty: IProperty = this._getChildPropertyClone(this.childProperties.length);
        this.childProperties.push(childProperty);
        this.isExpanded = true;

        const childValue: any = this.propertyService.getDefaultPropertyValue(this.property.childProperty.type);
        const childrenTarget: any[] = this._getChildrenTarget();
        childrenTarget[childProperty.key] = childValue;
        this.targetChanged.emit();
    }

    onRemoveChild(index: number): void {
        const childProperty: IProperty = this.childProperties[index];
        this.childProperties.splice(index, 1);
        this._updateChildrenKeys();

        const childrenTarget: any[] = this._getChildrenTarget();
        childrenTarget.splice(+childProperty.key, 1);
        this.targetChanged.emit();
    }

    protected _populateChildren(): void {
        this.childProperties = [];
        this._getChildrenTarget().forEach((_, index) => {
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

    private _updateChildrenKeys(): void {
        this.childProperties.forEach((child, index) => (child.key = index));
    }
}

@Component({
    selector: 'editor-object-property',
    templateUrl: './object-property.component.html',
    styleUrls: ['./object-property.component.scss'],
})
export class ObjectPropertyComponent extends ObjectArrayPropertyDirective<IObjectProperty, Record<string, any>> {
    constructor(propertyService: PropertyService) {
        super(propertyService);
    }

    public get canAdd(): boolean {
        return this.property.addOptions?.length > 0;
    }

    onAddChild(type: PropertyType, arrayType?: PropertyType): void {
        const childProperty: IProperty = this.propertyService.getDefaultProperty(type, undefined, arrayType);
        this.childProperties.push(childProperty);
        this.isExpanded = true;

        const childValue: any = this.propertyService.getDefaultPropertyValue(type);
        const childrenTarget: Record<string, any> = this._getChildrenTarget();
        childrenTarget[childProperty.key] = childValue;
        this.targetChanged.emit();
    }

    onRemoveChild(index: number): void {
        const childProperty: IProperty = this.childProperties[index];
        this.childProperties.splice(index, 1);

        const childrenTarget: Record<string, any> = this._getChildrenTarget();
        delete childrenTarget[childProperty.key];
        this.targetChanged.emit();
    }

    protected _populateChildren(): void {
        if (this.property.populateChildrenFromTarget) {
            this._populateChildrenFromTarget();
        } else {
            this._populateChildrenFromProperty();
        }
    }

    private _populateChildrenFromProperty() {
        this.childProperties = [...this.property.childProperties];
    }

    private _populateChildrenFromTarget() {
        this.childProperties = [];

        Object.entries(this._getChildrenTarget()).forEach(([key, value]) => {
            const childProperty = this.propertyService.getDefaultPropertyFromValue(value, key);
            if (childProperty) {
                this.childProperties.push(childProperty);
            }
        });
    }
}
