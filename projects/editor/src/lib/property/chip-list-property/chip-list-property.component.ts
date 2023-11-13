import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { BehaviorSubject, Subject, isObservable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BasePropertyDirective } from '../base-property.component';
import { IChipListProperty } from './chip-list-property.types';

@Component({
    selector: 'editor-chip-list-property',
    templateUrl: './chip-list-property.component.html',
    styleUrls: ['./chip-list-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipListPropertyComponent extends BasePropertyDirective<IChipListProperty, string | string[]> {
    @ViewChild('input') inputElementRef: ElementRef<HTMLInputElement>;

    public formControl: FormControl<string> = new FormControl();
    public separatorKeysCodes: number[] = [ENTER, COMMA];
    public selectedOptions$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    public selectableOptions: string[];
    public filteredOptions$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    public hasOptions: boolean;

    protected defaultValue = null;

    private _unSubOptions$: Subject<void> = new Subject();
    private readonly _maxFilteredItems = 50;

    onAdd(event: MatChipInputEvent): void {
        const input: HTMLInputElement = event.input;
        const value: string = event.value;
        this._updateSelectedOptions();

        if ((value || '').trim()) {
            this.selectedOptions$.next([...this.selectedOptions$.value, value.trim()]);
            this._updateValue();
        }

        if (input) {
            input.value = '';
        }

        this.formControl.setValue(null);
    }

    onRemove(option: string): void {
        this._updateSelectedOptions();
        const index: number = this.selectedOptions$.value.indexOf(option);
        if (index >= 0) {
            const newOptions = [...this.selectedOptions$.value];
            newOptions.splice(index, 1);
            this.selectedOptions$.next(newOptions);
            this._updateValue();
        }
    }

    onSelected(event: MatAutocompleteSelectedEvent): void {
        this._updateSelectedOptions();
        this.selectedOptions$.next([...this.selectedOptions$.value, event.option.viewValue]);
        this.inputElementRef.nativeElement.value = '';
        this.formControl.setValue(null);
        this._updateValue();
    }

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            this.formControl.valueChanges.subscribe(options => this._updateFilteredOptions(options));
        }

        this.hasOptions = this.property.isRemovable;
        this._setupSelectableOptions();
        this._updateSelectedOptions();
        this._updateFilteredOptions();
    }

    private _setupSelectableOptions(): void {
        if (isObservable(this.property.options)) {
            this._unSubOptions$.next();
            this.property.options
                .pipe(takeUntil(this._unSubOptions$))
                .subscribe(options => (this.selectableOptions = options));
        } else {
            this.selectableOptions = [...this.property.options];
        }
    }

    private _updateSelectedOptions(): void {
        if (this.currentValue) {
            // If the target already has some selection
            const existingOptions: string[] = this.property.outputString
                ? (this.currentValue as string).split(' ')
                : (this.currentValue as string[]);

            this.selectedOptions$.next([...existingOptions]);
        } else {
            this.selectedOptions$.next([]);
        }
    }

    private _updateFilteredOptions(value?: string): void {
        const selectable = value
            ? this.selectableOptions.filter(option => option.toLowerCase().includes(value.toLowerCase()))
            : this.selectableOptions;
        const notSelected = selectable.filter(option => !this.selectedOptions$.value.includes(option));
        this.filteredOptions$.next(notSelected.slice(0, this._maxFilteredItems));
    }

    private _updateValue(): void {
        let newValue: string | string[];
        if (this.property.outputString) {
            newValue = this.selectedOptions$.value.join(' ');
        } else {
            newValue = this.selectedOptions$.value.slice();
        }

        this._modifyValue(newValue);
    }
}
