import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { get, isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { IEditorFormlyField } from '../../editor.types';
import { FormService } from '../../form/form.service';

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

    protected override _updateOverrideState(): void {
        this.isInArray = this.path.split('.').some(k => !isNaN(Number(k)));
        const fieldOverride = (this.target as IEditorFormlyField)._info?.fieldOverride;
        if (fieldOverride) {
            this.isOverridden = !this.isInArray && !isNil(get(fieldOverride, this.path));
        } else {
            this.isOverridden = false;
        }
    }
}
