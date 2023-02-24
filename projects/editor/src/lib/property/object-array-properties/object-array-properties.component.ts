import { ChangeDetectionStrategy, Component, Directive, Input, OnInit, TrackByFunction } from '@angular/core';
import { cloneDeep } from 'lodash-es';

import { BasePropertyDirective } from '../base-property.component';
import { PropertyService } from '../property.service';
import { PropertyType, IProperty, IBaseProperty } from '../property.types';
import { IArrayProperty } from './array-property.types';
import { IObjectProperty } from './object-property.types';

@Directive()
export abstract class ObjectArrayPropertyDirective<P extends IBaseProperty, V>
    extends BasePropertyDirective<P, V>
    implements OnInit
{
    @Input() isExpanded: boolean;
    public canAdd: boolean;
    public hasOptions: boolean;

    public typeofProperty: typeof PropertyType = PropertyType;
    public childProperties: IProperty[] = [];
    public childrenTreeLevel: number;

    constructor(public propertyService: PropertyService) {
        super();
    }

    protected abstract get _canAdd(): boolean;

    trackByPropertyKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

    ngOnInit(): void {
        this.childrenTreeLevel = this.treeLevel + 1;
    }

    getChildPath(key: string | number): string {
        return this.path ? `${this.path}.${key}` : key + '';
    }

    protected _onChanged(): void {
        this.canAdd = this._canAdd;
        this.hasOptions = this.property.isRemovable || this._canAdd;
        this._populateChildren();
    }

    protected abstract _populateChildren(): void;
}

@Component({
    selector: 'editor-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayPropertyComponent extends ObjectArrayPropertyDirective<IArrayProperty, unknown[]> {
    protected defaultValue = [];

    protected get _canAdd(): boolean {
        return this.property.canAdd;
    }

    onAddChild(): void {
        const childValue: any = this.propertyService.getDefaultPropertyValue(this.property.childProperty.type);
        const newValue = [...this.currentValue, childValue];
        this._modifyValue(newValue);

        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const newValue = this.currentValue.filter((_, i) => i !== index);
        this._modifyValue(newValue);
    }

    protected _populateChildren(): void {
        this.childProperties = [];
        this.currentValue.forEach((_, index) => {
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectPropertyComponent extends ObjectArrayPropertyDirective<IObjectProperty, Record<string, unknown>> {
    protected defaultValue = {};

    protected get _canAdd(): boolean {
        return !!this.property.addOptions?.length;
    }

    onAddChild(type: PropertyType, arrayType?: PropertyType): void {
        const childValue: any = this.propertyService.getDefaultPropertyValue(type);
        const newValue = {
            ...this.currentValue,
            '': childValue,
        };
        this._modifyValue(newValue);

        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const childProperty: IProperty = this.childProperties[index];

        const newValue = { ...this.currentValue };
        delete newValue[childProperty.key];
        this._modifyValue(newValue);
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

        Object.entries(this.currentValue).forEach(([key, value]) => {
            const childProperty = this.propertyService.getDefaultPropertyFromValue(value, key);
            if (childProperty) {
                this.childProperties.push(childProperty);
            }
        });
    }
}
