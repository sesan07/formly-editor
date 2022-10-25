import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { BasePropertyDirective } from '../base-property.component';
import { IBooleanProperty } from './boolean-property.types';

@Component({
    selector: 'editor-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanPropertyComponent extends BasePropertyDirective<IBooleanProperty, boolean> {
    public formControl: FormControl;
    public hasOptions: boolean;

    protected defaultValue = false;

    protected _onChanged(isFirstChange: boolean): void {
        this.hasOptions = this.property.isRemovable;

        if (isFirstChange) {
            this.formControl = new FormControl(this.currentValue);
            this.formControl.valueChanges.subscribe(val => this._modifyValue(val));
        }

        this.formControl.setValue(this.currentValue, {
            emitEvent: false,
        });
    }
}
