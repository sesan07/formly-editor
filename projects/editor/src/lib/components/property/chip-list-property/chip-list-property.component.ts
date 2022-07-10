import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { isObservable, Observable, Subject } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { IChipListProperty } from './chip-list-property.types';
import { BasePropertyDirective } from '../base-property.component';

@Component({
    selector: 'editor-chip-list-property',
    templateUrl: './chip-list-property.component.html',
    styleUrls: ['./chip-list-property.component.scss'],
})
export class ChipListPropertyComponent extends BasePropertyDirective<IChipListProperty> {
    @ViewChild('input') inputElementRef: ElementRef<HTMLInputElement>;

    public formControl: FormControl = new FormControl();
    public separatorKeysCodes: number[] = [ENTER, COMMA];
    public selectedOptions: string[];
    public selectableOptions: string[];
    public filteredOptions: Observable<string[]>;

    private _unSubOptions$: Subject<void> = new Subject();
    private _unSubHiddenOptions$: Subject<void> = new Subject();
    private _hiddenOptions: string[];

	public get hasOptions(): boolean {
		return this.property.isRemovable;
	};

    isHidden(option: string): boolean {
        return this._hiddenOptions
            ? this._hiddenOptions.includes(option)
            : false;
    }

    onAdd(event: MatChipInputEvent): void {
        const input: HTMLInputElement = event.input;
        const value: string = event.value;
        this._updateSelectedOptions();

        if ((value || '').trim()) {
            this.selectedOptions.push(value.trim());
            this._updateValue();
        }

        if (input) {
            input.value = '';
        }

        this.formControl.setValue(null);
    }

    onRemove(option: string): void {
        this._updateSelectedOptions();
        const index: number = this.selectedOptions.indexOf(option);
        if (index >= 0) {
            this.selectedOptions.splice(index, 1);
            this._updateValue();
        }
    }

    onSelected(event: MatAutocompleteSelectedEvent): void {
        this._updateSelectedOptions();
        this.selectedOptions.push(event.option.viewValue);
        this.inputElementRef.nativeElement.value = '';
        this.formControl.setValue(null);
        this._updateValue();
    }

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.filteredOptions = this.formControl.valueChanges.pipe(
                startWith(''),
                map((option: string) => option ? this._filter(option) : this.selectableOptions.slice())
            );
        }

        this._setupSelectableOptions();
        this._setupHiddenOptions();
        this._updateSelectedOptions();
    }

    private _setupSelectableOptions(): void {
        if (isObservable(this.property.options)) {
            this._unSubOptions$.next();
            this.property.options
                .pipe(takeUntil(this._unSubOptions$))
                .subscribe(options => this.selectableOptions = options);
        } else {
            this.selectableOptions = [...this.property.options];
        }
    }

    private _setupHiddenOptions(): void {
        if (!this.property.hiddenOptions) {
            return;
        }

        if (isObservable(this.property.hiddenOptions)) {
            this._unSubHiddenOptions$.next();
            this.property.hiddenOptions
                .pipe(takeUntil(this._unSubHiddenOptions$))
                .subscribe(options => this._hiddenOptions = options);
        } else {
            this._hiddenOptions = [...this.property.hiddenOptions];
        }
    }

    private _filter(value: string): string[] {
        const filterValue: string = value.toLowerCase();
        return this.selectableOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }

    private _updateSelectedOptions(): void {
        const value: string | string[] = this._getPropertyValue();
        if (value) { // If the target already has some selection
            const existingOptions: string[] = this.property.outputString
                ? (value as string).split(' ')
                : value as string[];

            this.selectedOptions = [...existingOptions];
        } else {
            this.selectedOptions = [];
        }
    }

    private _updateValue(): void {
        let newValue: string | string[];
        if (this.property.outputString) {
            newValue = this.selectedOptions.join(' ');
        } else  {
            newValue = this.selectedOptions.slice();
        }

        this._modifyValue(newValue);
    }
}
