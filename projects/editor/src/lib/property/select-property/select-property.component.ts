import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';

import { BasePropertyDirective } from '../base-property.directive';
import { ISelectProperty, ISelectPropertyOption } from './select-property.types';

@Component({
    selector: 'editor-select-property',
    templateUrl: './select-property.component.html',
    styleUrls: ['./select-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, MatSelect, ReactiveFormsModule, MatOption, MatIconButton, MatSuffix, MatIcon],
})
export class SelectPropertyComponent extends BasePropertyDirective<ISelectProperty, string | number> {
    public formControl: FormControl<string | number>;
    public hasOptions: boolean;

    protected defaultValue = undefined;

    onClear(): void {
        this.formControl.setValue(undefined);
    }

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

    protected override _isValidProperty(x: any): x is ISelectProperty {
        return Array.isArray(x.options) && x.options.every(this._isValidOption) && this._isBaseProperty(x);
    }

    private _isValidOption(x: any): x is ISelectPropertyOption {
        return typeof x.label === 'string' && (typeof x.value === 'string' || typeof x.value === 'number');
    }
}
