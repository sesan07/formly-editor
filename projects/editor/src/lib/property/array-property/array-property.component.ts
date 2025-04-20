import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import {
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { TreeItemComponent } from '../../tree-item/tree-item.component';
import { BooleanPropertyComponent } from '../boolean-property/boolean-property.component';
import { ChipListPropertyComponent } from '../chip-list-property/chip-list-property.component';
import { ObjectArrayPropertyDirective } from '../collection.property.directive';
import { InputPropertyComponent } from '../input-property/input-property.component';
import { ObjectPropertyComponent } from '../object-property/object-property.component';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { IProperty, PropertyType } from '../property.types';
import { getDefaultPropertyFromValue, getDefaultPropertyValue } from '../property.utils';
import { TextareaPropertyComponent } from '../textarea-property/textarea-property.component';
import { IArrayProperty } from './array-property.types';

@Component({
    selector: 'editor-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TreeItemComponent,
        PropertyKeyComponent,
        NgTemplateOutlet,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatIconButton,
        MatIcon,
        MatAccordion,
        MatExpansionPanelTitle,
        forwardRef(() => ObjectPropertyComponent),
        BooleanPropertyComponent,
        ChipListPropertyComponent,
        TextareaPropertyComponent,
        InputPropertyComponent,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
    ]
})
export class ArrayPropertyComponent extends ObjectArrayPropertyDirective<IArrayProperty, unknown[]> {
    protected defaultValue = [];

    protected get _canAdd(): boolean {
        return this.property.canAdd;
    }

    onAddChild(type: PropertyType): void {
        const childValue: any = getDefaultPropertyValue(type);
        const newValue = [...this.currentValue, childValue];
        this._modifyValue(newValue);

        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const newValue = this.currentValue.filter((_, i) => i !== index);
        this._modifyValue(newValue);
    }

    protected override _isValidProperty(x: any): x is IArrayProperty {
        return this._isBaseProperty(x);
    }

    protected _populateChildren(): void {
        this.childProperties = this.currentValue.map((childValue, index) => {
            let childProperty: IProperty;
            if (this.property.childProperty) {
                childProperty = structuredClone(this.property.childProperty);
            } else {
                childProperty = getDefaultPropertyFromValue(childValue ?? '');
            }
            childProperty.key = index;
            childProperty.isKeyEditable = false;

            return childProperty;
        });
    }
}
