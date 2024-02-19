import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { BasePropertyDirective } from '../base-property.directive';
import { IBooleanProperty } from './boolean-property.types';

@Component({
    selector: 'editor-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanPropertyComponent extends BasePropertyDirective<IBooleanProperty, boolean> {
    public formControl: FormControl<boolean>;
    public hasOptions: boolean;
    public isInArray: boolean;

    protected defaultValue = false;

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.formControl = new FormControl(this.currentValue);
            this.formControl.valueChanges.subscribe(val => this._modifyValue(val));
        }

        this.hasOptions = this.property.isRemovable;
        this.formControl.setValue(this.currentValue, {
            emitEvent: false,
        });
    }

    protected override _isValidProperty(x: any): x is IBooleanProperty {
        return this._isBaseProperty(x);
    }
}
