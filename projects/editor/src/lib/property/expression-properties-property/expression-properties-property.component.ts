import { ChangeDetectionStrategy, Component } from '@angular/core';
import { trackByKey } from '../../editor.utils';

import { BasePropertyDirective } from '../base-property.directive';
import { IExpressionPropertiesProperty, IExpressionProperty } from './expression-properties-property.types';
import { TextEditorComponent } from '../../text-editor/text-editor.component';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader, MatAccordion, MatExpansionPanelTitle } from '@angular/material/expansion';

@Component({
    selector: 'editor-expression-properties-property',
    templateUrl: './expression-properties-property.component.html',
    styleUrls: ['./expression-properties-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatIconButton,
        MatIcon,
        MatAccordion,
        NgFor,
        MatExpansionPanelTitle,
        PropertyKeyComponent,
        TextEditorComponent,
    ],
})
export class ExpressionPropertiesPropertyComponent extends BasePropertyDirective<
    IExpressionPropertiesProperty,
    Record<string, string>
> {
    public isExpanded: boolean;
    public childProperties: IExpressionProperty[] = [];

    trackByKey = trackByKey;

    protected defaultValue = {};

    onAddChild(): void {
        this.isExpanded = true;
        this.onChildKeyChanged('', '');
    }

    onRemoveChild(key: string): void {
        this._modifyKey([...this.path, key], undefined);
    }

    onChildKeyChanged(currKey: string, newKey: string): void {
        this._modifyKey([...this.path, currKey], [...this.path, newKey]);
    }

    onChildValueChanged(key: string, value: string): void {
        this._modifyValue(value, [...this.path, key]);
    }

    protected _onChanged(isFirstChange: boolean): void {
        this._populateChildrenFromTarget();
    }

    protected override _isValidProperty(x: any): x is IExpressionPropertiesProperty {
        return this._isBaseProperty(x);
    }

    private _populateChildrenFromTarget() {
        this.childProperties = Object.entries(this.currentValue).map(([key, value], i) => ({ key, value }));
    }
}
