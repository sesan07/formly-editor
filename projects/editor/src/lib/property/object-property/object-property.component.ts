import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { TreeItemComponent } from '../../tree-item/tree-item.component';
import { ArrayPropertyComponent } from '../array-property/array-property.component';
import { BooleanPropertyComponent } from '../boolean-property/boolean-property.component';
import { ChipListPropertyComponent } from '../chip-list-property/chip-list-property.component';
import { ObjectArrayPropertyDirective } from '../collection.property.directive';
import { ExpressionPropertiesPropertyComponent } from '../expression-properties-property/expression-properties-property.component';
import { InputPropertyComponent } from '../input-property/input-property.component';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { IProperty, PropertyType } from '../property.types';
import { getDefaultPropertyFromValue, getDefaultPropertyValue } from '../property.utils';
import { SelectPropertyComponent } from '../select-property/select-property.component';
import { TextareaPropertyComponent } from '../textarea-property/textarea-property.component';
import { ValidatorsPropertyComponent } from '../validators-property/validators-property.component';
import { IObjectProperty } from './object-property.types';

@Component({
    selector: 'editor-object-property',
    templateUrl: './object-property.component.html',
    styleUrls: ['./object-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TreeItemComponent,
        PropertyKeyComponent,
        NgTemplateOutlet,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatIconButton,
        MatMenuTrigger,
        MatIcon,
        ArrayPropertyComponent,
        BooleanPropertyComponent,
        ChipListPropertyComponent,
        SelectPropertyComponent,
        TextareaPropertyComponent,
        ExpressionPropertiesPropertyComponent,
        InputPropertyComponent,
        MatMenu,
        MatMenuItem,
        ValidatorsPropertyComponent,
    ],
})
export class ObjectPropertyComponent extends ObjectArrayPropertyDirective<IObjectProperty, Record<string, unknown>> {
    @Input() useExpansionPanel = true;
    @Input() showCount = true;

    public childrenTreeMode: boolean;

    protected defaultValue = {};

    protected get _canAdd(): boolean {
        return this.property.canAdd;
    }

    onAddChild(type: PropertyType): void {
        const childValue: any = getDefaultPropertyValue(type);
        const newValue = {
            ...this.currentValue,
            // eslint-disable-next-line @typescript-eslint/naming-convention
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

    protected override _isValidProperty(x: any): x is IObjectProperty {
        return Array.isArray(x.childProperties) && this._isBaseProperty(x);
    }

    protected _populateChildren(): void {
        this.childrenTreeMode = this.property.childrenTreeMode || this.treeMode;
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
            const childProperty = getDefaultPropertyFromValue(value, key);
            if (childProperty) {
                this.childProperties.push(childProperty);
            }
        });
    }
}
