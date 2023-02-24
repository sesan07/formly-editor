import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { IEditorFormlyField } from '../../../editor.types';
import { IPropertyChange, PropertyChangeType } from '../../../property/property.types';
import { BreakpointAffix, ClassProperty, IBreakpoint, IStyleOption, IStyleOptionCategory } from '../styles.types';

@Component({
    selector: 'editor-style-option',
    templateUrl: './style-option.component.html',
    styleUrls: ['./style-option.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

    get classPrefix(): string {
        return this.option.value ? `${this.option.value}-` : '';
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
        const newClassName = this._addBreakpoint(this.option, `${this.classPrefix}${variant}`, '', '');
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
        const classPrefix: string = option.value ? `${option.value}-` : '';
        const variantsStr = `(${option.variants.join('|')})`;
        const regex = new RegExp(
            `(?<=(\\s|^))${this._addBreakpoint(
                option,
                `${classPrefix}${variantsStr}`,
                '',
                '',
                currBreakpoint
            )}(?=(\\s|$))`
        );
        const cleaned = propertyValue
            .replace(regex, '*')
            .split(' ')
            .filter(c => c !== '*')
            .join(' ');

        return cleaned;
    }

    private _updateSelection(): void {
        const variantsStr = `(${this.option.variants.join('|')})`;
        const regex = new RegExp(
            `(?<=${this._addBreakpoint(this.option, `${this.classPrefix})${variantsStr}(?=`, '(\\s|^)', '(\\s|$)')})`
        );
        const matches: string[] | null = this.propertyValue?.match(regex);
        this.selectedVariant = matches ? matches[0] : null;
    }

    private _addBreakpoint(
        option: IStyleOption,
        text: string,
        prefixDefault: string,
        suffixDefault: string,
        breakpoint: IBreakpoint = this.breakpoint
    ): string {
        return `${
            this.breakpointAffix === BreakpointAffix.PREFIX && breakpoint.value && option.hasBreakpoints
                ? breakpoint.value
                : prefixDefault
        }${text}${
            this.breakpointAffix === BreakpointAffix.SUFFIX && breakpoint.value && option.hasBreakpoints
                ? breakpoint.value
                : suffixDefault
        }`;
    }

    private _emitChange(newValue: string): void {
        this.optionChanged.emit({
            type: PropertyChangeType.VALUE,
            path: this.propertyPath,
            data: newValue,
        });
    }
}
