import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { BasePropertyDirective } from '../base-property.directive';
import { ISelectProperty } from './select-property.types';

@Component({
    selector: 'editor-select-property',
    templateUrl: './select-property.component.html',
    styleUrls: ['./select-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
}
