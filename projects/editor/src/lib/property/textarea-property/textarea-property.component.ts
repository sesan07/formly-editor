import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem } from '@angular/material/menu';

import { TreeItemComponent } from '../../tree-item/tree-item.component';
import { BasePropertyDirective } from '../base-property.directive';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { ITextareaProperty } from './textarea-property.types';

@Component({
    selector: 'editor-textarea-property',
    templateUrl: './textarea-property.component.html',
    styleUrls: ['./textarea-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TreeItemComponent,
        PropertyKeyComponent,
        MatFormField,
        MatInput,
        CdkTextareaAutosize,
        ReactiveFormsModule,
        MatLabel,
        MatMenu,
        MatMenuItem,
        MatIcon,
    ]
})
export class TextareaPropertyComponent extends BasePropertyDirective<ITextareaProperty, string> {
    public formControl: FormControl<string>;
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

    protected override _isValidProperty(x: any): x is ITextareaProperty {
        return this._isBaseProperty(x);
    }
}
