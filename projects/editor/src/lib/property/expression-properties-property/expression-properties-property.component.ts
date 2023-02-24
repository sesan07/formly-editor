import { ChangeDetectionStrategy, Component } from '@angular/core';
import { trackByKey } from '../../editor.utils';

import { BasePropertyDirective } from '../base-property.component';
import { IExpressionPropertiesProperty, IExpressionProperty } from './expression-properties-property.types';

@Component({
    selector: 'editor-expression-properties-property',
    templateUrl: './expression-properties-property.component.html',
    styleUrls: ['./expression-properties-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        this._modifyKey(undefined, undefined, key);
    }

    onChildKeyChanged(currKey: string, newKey: string): void {
        this._modifyKey(this.currentValue[currKey] || '', newKey, currKey);
    }

    onChildValueChanged(key: string, value: string): void {
        this._modifyValue(value, key);
    }

    protected _onChanged(isFirstChange: boolean): void {
        this._populateChildrenFromTarget();
    }

    private _populateChildrenFromTarget() {
        this.childProperties = Object.entries(this.currentValue).map(([key, value], i) => ({ key, value }));
    }
}
