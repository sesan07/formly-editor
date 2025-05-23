import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { BehaviorSubject } from 'rxjs';

import { TreeItemComponent } from '../../tree-item/tree-item.component';
import { BasePropertyDirective } from '../base-property.directive';
import { PropertyKeyComponent } from '../property-key/property-key.component';
import { IChipListProperty } from './chip-list-property.types';

@Component({
    selector: 'editor-chip-list-property',
    templateUrl: './chip-list-property.component.html',
    styleUrls: ['./chip-list-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TreeItemComponent,
        PropertyKeyComponent,
        NgTemplateOutlet,
        MatFormField,
        MatLabel,
        MatChipGrid,
        MatChipRow,
        MatIcon,
        MatChipRemove,
        ReactiveFormsModule,
        MatAutocompleteTrigger,
        MatChipInput,
        MatAutocomplete,
        MatOption,
        MatMenu,
        MatMenuItem,
        AsyncPipe,
    ],
})
export class ChipListPropertyComponent extends BasePropertyDirective<IChipListProperty, string | string[]> {
    @ViewChild('input') inputElementRef: ElementRef<HTMLInputElement>;

    public formControl = new FormControl<string>(null);
    public separatorKeysCodes: number[] = [ENTER, COMMA];
    public selectedOptions$ = new BehaviorSubject<string[]>([]);
    public selectableOptions: string[];
    public filteredOptions$ = new BehaviorSubject<string[]>([]);
    public hasOptions: boolean;

    protected defaultValue = null;

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
        this.selectableOptions = [...this.property.options];
        this._updateSelectedOptions();
        this._updateFilteredOptions();
    }

    protected override _isValidProperty(x: any): x is IChipListProperty {
        return Array.isArray(x.options) && x.options.every(v => typeof v === 'string') && this._isBaseProperty(x);
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
