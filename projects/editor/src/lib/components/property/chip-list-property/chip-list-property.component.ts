import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { IChipListProperty } from './chip-list-property.types';
import { BasePropertyComponent } from '../base-property.component';

@Component({
    selector: 'lib-chip-list-property',
    templateUrl: './chip-list-property.component.html',
    styleUrls: ['./chip-list-property.component.scss'],
})
export class ChipListPropertyComponent extends BasePropertyComponent implements OnInit {
    @Input() property: IChipListProperty;

    @ViewChild('input') inputElementRef: ElementRef<HTMLInputElement>;




    public formControl: FormControl = new FormControl();
    public separatorKeysCodes: number[] = [ENTER, COMMA];
    public selectedOptions: string[] = [];
    public selectableOptions: string[] = [];
    public filteredOptions: Observable<string[]>;
	public get hasOptions(): boolean {
		return this.property.isDeletable;
	};

	protected propertyname = 'Chiplist';

    ngOnInit(): void {
		super.ngOnInit();

        if (this.target[this.property.key]) { // If the target already has some selection
            const existingOptions: string[] = this.property.outputString
                ? (this.target[this.property.key] as string).split(' ')
                : this.target[this.property.key] as string[];

            this.selectedOptions.push(...existingOptions);
        }

        this.selectableOptions.push(...this.property.options);
        this.filteredOptions = this.formControl.valueChanges.pipe(
            startWith(''),
            map((option: string) => option ? this._filter(option) : this.selectableOptions.slice()));
    }

    isRemovable(option: string): boolean {
        return this.property.notRemovableOptions
            ? (this.property.notRemovableOptions as string[]).indexOf(option) === -1
            : true;
    }


    onAdd(event: MatChipInputEvent): void {
        const input: HTMLInputElement = event.input;
        const value: string = event.value;

        if ((value || '').trim()) {
            this.selectedOptions.push(value.trim());
            this._updateProperty();
        }

        if (input) {
            input.value = '';
        }

        this.formControl.setValue(null);
    }

    onRemove(option: string): void {
        const index: number = this.selectedOptions.indexOf(option);
        if (index >= 0) {
            this.selectedOptions.splice(index, 1);
            this._updateProperty();
        }
    }

    onSelected(event: MatAutocompleteSelectedEvent): void {
        this.selectedOptions.push(event.option.viewValue);
        this.inputElementRef.nativeElement.value = '';
        this.formControl.setValue(null);
        this._updateProperty();
    }

    private _filter(value: string): string[] {
        const filterValue: string = value.toLowerCase();
        return this.selectableOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }

    private _updateProperty(): void {
        if (this.property.outputString) {
            this.target[this.property.key] = this.selectedOptions.join(' ');
        } else  {
            this.target[this.property.key] = this.selectedOptions.slice();
        }

		this.onValueChanged();
    }
}
