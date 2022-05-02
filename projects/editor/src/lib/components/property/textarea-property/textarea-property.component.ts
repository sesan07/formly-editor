import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasePropertyComponent } from '../base-property.component';
import { PropertyValueChangeType } from '../property.types';
import { ITextareaProperty } from './textarea-property.types';

@Component({
    selector: 'lib-textarea-property',
    templateUrl: './textarea-property.component.html',
    styleUrls: ['./textarea-property.component.scss']
})
export class TextareaPropertyComponent extends BasePropertyComponent implements OnInit {
	@Input() property: ITextareaProperty;

    public formControl: FormControl;

    public get hasOptions(): boolean {
        return this.property.isDeletable;
    };

    protected propertyname = 'Textarea';

    ngOnInit(): void {
        this.formControl = new FormControl(this.target[this.property.key]);
        this.formControl.valueChanges.subscribe(val => {
            this.onValueChanged({
                type: PropertyValueChangeType.MODIFY,
                path: this.path,
                value: val
            });
        });
    }

}
