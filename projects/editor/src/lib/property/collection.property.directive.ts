import { Directive, Input, OnInit, TrackByFunction } from '@angular/core';

import { IArrayProperty } from './array-property/array-property.types';
import { BasePropertyDirective } from './base-property.directive';
import { IObjectProperty } from './object-property/object-property.types';
import { IProperty, PropertyType } from './property.types';

@Directive()
export abstract class ObjectArrayPropertyDirective<P extends IArrayProperty | IObjectProperty, V>
    extends BasePropertyDirective<P, V>
    implements OnInit
{
    @Input() isExpanded: boolean;
    public canAdd: boolean;
    public hasOptions: boolean;
    public addOptions: PropertyType[] = [
        PropertyType.ARRAY,
        PropertyType.BOOLEAN,
        PropertyType.NUMBER,
        PropertyType.OBJECT,
        PropertyType.TEXT,
        PropertyType.TEXTAREA,
    ];

    public typeofProperty: typeof PropertyType = PropertyType;
    public childProperties: IProperty[] = [];
    public childrenTreeLevel: number;

    protected abstract get _canAdd(): boolean;

    trackByPropertyKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

    ngOnInit(): void {
        this.childrenTreeLevel = this.treeLevel + 1;
    }

    getChildPath(key: string | number): string[] {
        return [...this.path, ...key.toString().split('.')];
    }

    protected _onChanged(): void {
        this.canAdd = this.property.canAdd;
        this.hasOptions = this.property.isRemovable || this._canAdd;
        this._populateChildren();
    }

    protected abstract _populateChildren(): void;
}
