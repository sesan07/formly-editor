import { ChangeDetectionStrategy, Component, Directive, Input, OnInit, TrackByFunction } from '@angular/core';

import { BasePropertyDirective } from '../base-property.component';
import { PropertyService } from '../property.service';
import { PropertyType, IProperty } from '../property.types';
import { IArrayProperty } from './array-property.types';
import { IObjectProperty } from './object-property.types';

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

    constructor(public propertyService: PropertyService) {
        super();
    }

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

    onAddChild(type: PropertyType): void {
        const childValue: any = this.propertyService.getDefaultPropertyValue(type);
        const newValue = [...this.currentValue, childValue];
        this._modifyValue(newValue);

        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const newValue = this.currentValue.filter((_, i) => i !== index);
        this._modifyValue(newValue);
    }

    protected _populateChildren(): void {
        this.childProperties = this.currentValue.map((childValue, index) => {
            let childProperty: IProperty;
            if (this.property.childProperty) {
                childProperty = structuredClone(this.property.childProperty);
            } else {
                childProperty = this.propertyService.getDefaultPropertyFromValue(childValue ?? '');
            }
            childProperty.key = index;
            childProperty.isKeyEditable = false;

            return childProperty;
        });
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
        return this.property.canAdd;
    }

    onAddChild(type: PropertyType): void {
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

        Object.entries(this.currentValue ?? {}).forEach(([key, value]) => {
            const childProperty = this.propertyService.getDefaultPropertyFromValue(value, key);
            if (childProperty) {
                this.childProperties.push(childProperty);
            }
        });
    }
}
