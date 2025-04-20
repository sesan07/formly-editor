import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import {
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';

import { TextEditorComponent } from '../../text-editor/text-editor.component';
import { BasePropertyDirective } from '../base-property.directive';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { IExpressionPropertiesProperty, IExpressionProperty } from './expression-properties-property.types';

@Component({
    selector: 'editor-expression-properties-property',
    templateUrl: './expression-properties-property.component.html',
    styleUrls: ['./expression-properties-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatIconButton,
        MatIcon,
        MatAccordion,
        MatExpansionPanelTitle,
        PropertyKeyComponent,
        TextEditorComponent,
    ]
})
export class ExpressionPropertiesPropertyComponent extends BasePropertyDirective<
    IExpressionPropertiesProperty,
    Record<string, string>
> {
    public isExpanded: boolean;
    public childProperties: IExpressionProperty[] = [];

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

    protected _onChanged(): void {
        this._populateChildrenFromTarget();
    }

    protected override _isValidProperty(x: any): x is IExpressionPropertiesProperty {
        return this._isBaseProperty(x);
    }

    private _populateChildrenFromTarget() {
        this.childProperties = Object.entries(this.currentValue).map(([key, value]) => ({ key, value }));
    }
}
