import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { get, isNil } from 'lodash-es';
import { IEditorFormlyField } from '../../editor.types';

import { BasePropertyDirective } from '../base-property.component';
import { PropertyType } from '../property.types';
import { IInputProperty } from './input-property.types';

@Component({
    selector: 'editor-input-property',
    templateUrl: './input-property.component.html',
    styleUrls: ['./input-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPropertyComponent extends BasePropertyDirective<IInputProperty, string | number | boolean> {
    public formControl: FormControl;
    public hasOptions: boolean;
    public isInArray: boolean;

    protected defaultValue = null;

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.formControl = new FormControl(this.currentValue);
            this.formControl.valueChanges.subscribe(val => this._updateValue(val));
        }

        this.hasOptions = this.property.isRemovable;
        this.formControl.setValue(this.currentValue, {
            emitEvent: false,
        });
    }

    private _updateValue(value: string): void {
        if (this.property.type === PropertyType.NUMBER && isNaN(Number(value))) {
            this.formControl.setValue(this.currentValue, {
                emitEvent: false,
            });

            return;
        }

        let newValue: string | number | boolean;
        if (value === '') {
            newValue = null;
        } else if (this.property.outputRawValue) {
            // eslint-disable-next-line @typescript-eslint/quotes
            if (value.match("'.*'")) {
                // enforced string (when the value is wrapped in single quotes)
                // eslint-disable-next-line @typescript-eslint/quotes
                newValue = value.match("(?<=').*(?=')")[0];
            } else if (!isNaN(Number(value))) {
                // Number
                newValue = Number(value);
            } else if (value === 'true' || value === 'false') {
                // Boolean
                newValue = value === 'true';
            } else {
                // string
                newValue = value;
            }
        } else {
            newValue = value;
        }

        this._modifyValue(newValue);
    }
}
