import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BasePropertyDirective } from '../base-property.directive';
import { IBooleanProperty } from './boolean-property.types';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatCheckbox } from '@angular/material/checkbox';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { TreeItemComponent } from '../../tree-item/tree-item.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'editor-boolean-property',
    templateUrl: './boolean-property.component.html',
    styleUrls: ['./boolean-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        TreeItemComponent,
        PropertyKeyComponent,
        MatCheckbox,
        ReactiveFormsModule,
        MatMenu,
        MatMenuItem,
        MatIcon,
    ],
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
