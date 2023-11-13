import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { BasePropertyDirective } from '../base-property.component';
import { ITextareaProperty } from './textarea-property.types';

@Component({
    selector: 'editor-textarea-property',
    templateUrl: './textarea-property.component.html',
    styleUrls: ['./textarea-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaPropertyComponent extends BasePropertyDirective<ITextareaProperty, string> {
    public formControl: FormControl;
    public hasOptions: boolean;

    protected defaultValue = '';

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
