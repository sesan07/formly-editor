import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';

import { IEditorFormlyField } from '../../../editor.types';
import { IPropertyChange, PropertyChangeType } from '../../../property/property.types';
import { BreakpointAffix, ClassProperty, IBreakpoint, IStyleOption, IStyleOptionCategory } from '../styles.types';
import { findVariant, formatVariant } from '../styles.utils';

@Component({
    selector: 'editor-style-option',
    templateUrl: './style-option.component.html',
    styleUrls: ['./style-option.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatFormField, MatLabel, MatSelect, MatOption, MatIconButton, MatIcon],
})
export class StyleOptionComponent implements OnChanges {
    @Input() field: IEditorFormlyField;
    @Input() parentField: IEditorFormlyField;
    @Input() propertyPath: string;
    @Input() option: IStyleOption;
    @Input() breakpointAffix: BreakpointAffix;
    @Input() breakpoint: IBreakpoint;
    @Input() allBreakpoints: IBreakpoint[];
    @Input() classNameCategories: IStyleOptionCategory[];
    @Input() fieldGroupClassNameCategories: IStyleOptionCategory[];

    @Output() optionChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    selectedVariant: string;

    get propertyValue(): string {
        return this.field[this.propertyPath] ?? '';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.field && this.field) {
            this._updateSelection();
        }
    }

    onRemoveSelection(): void {
        this._emitChange(this._removeSelection());
    }

    onVariantSelected(variant: string): void {
        let newPropertyValue: string = this._removeSelection();
        const newClassName = formatVariant(variant, this.option, this.breakpoint, this.breakpointAffix);
        if (newPropertyValue) {
            newPropertyValue = `${newPropertyValue} ${newClassName}`;
        } else {
            newPropertyValue = newClassName;
        }

        this._emitChange(newPropertyValue);
    }

    private _removeSelection(): string {
        let newPropertyValue: string = this._removeOption(this.option, this.propertyValue, this.breakpoint);
        newPropertyValue = this._removeDependencies(ClassProperty.CLASS_NAME, newPropertyValue);
        newPropertyValue = this._removeDependencies(ClassProperty.FIELD_GROUP_CLASS_NAME, newPropertyValue);

        return newPropertyValue;
    }

    private _removeDependencies(property: ClassProperty, propertyValue: string): string {
        let categories: IStyleOptionCategory[] = [];
        if (property === ClassProperty.CLASS_NAME) {
            categories = this.classNameCategories;
        } else if (property === ClassProperty.FIELD_GROUP_CLASS_NAME) {
            categories = this.fieldGroupClassNameCategories;
        }

        return this.allBreakpoints.reduce(
            (a, breakpoint) =>
                categories.reduce(
                    (b, category) =>
                        category.options.reduce(
                            (c, option) => (this._isADependent(option) ? this._removeOption(option, c, breakpoint) : c),
                            b
                        ),
                    a
                ),
            propertyValue
        );
    }

    private _isADependent(option: IStyleOption): boolean {
        const { property, value } = option.dependsOn ?? {};
        return property === this.propertyPath && value === this.selectedVariant;
    }

    private _removeOption(
        option: IStyleOption,
        propertyValue: string,
        currBreakpoint: IBreakpoint = this.breakpoint
    ): string {
        const variantsStr = `(${option.variants.join('|')})`;
        const regex = new RegExp(
            `(?<=(\\s|^))${formatVariant(variantsStr, option, currBreakpoint, this.breakpointAffix)}(?=(\\s|$))`
        );
        const cleaned = propertyValue
            .replace(regex, '*')
            .split(' ')
            .filter(c => c !== '*')
            .join(' ');

        return cleaned;
    }

    private _updateSelection(): void {
        this.selectedVariant = findVariant(
            this.propertyValue ?? '',
            this.option,
            this.breakpoint,
            this.breakpointAffix
        );
    }

    private _emitChange(newValue: string): void {
        this.optionChanged.emit({
            type: PropertyChangeType.VALUE,
            path: [this.propertyPath],
            value: newValue,
        });
    }
}
