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
import { BreakpointType } from '../styles.types';
import { IStyleOption } from './style-option.types';

@Component({
    selector: 'editor-style-option',
    templateUrl: './style-option.component.html',
    styleUrls: ['./style-option.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleOptionComponent implements OnChanges {
    @Input() field: IEditorFormlyField;
    @Input() propertyPath: string;
    @Input() config: IStyleOption;
    @Input() breakpoint: BreakpointType;

    @Output() optionChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    selectedVariant: string;
    selectedVariantOptions: IStyleOption[];

    get propertyValue(): string {
        return this.field[this.propertyPath] ?? '';
    }

    get classNamePrefix(): string {
        return this.config.value ? `${this.config.value}-` : '';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.field) {
            this._updateSelection();
        }
    }

    onVariantSelected(variant: string): void {
        let newPropertyValue: string = this._removeVariant(this.config, this.selectedVariant, this.propertyValue);
        if (!this.config.value) {
            newPropertyValue = newPropertyValue ? `${newPropertyValue} ${variant}` : variant;
        } else {
            const newClassName = `${this.classNamePrefix}${variant}${this.breakpoint ? '-' + this.breakpoint : ''}`;
            if (this.propertyValue) {
                const regex = new RegExp(
                    `${this.classNamePrefix}[a-z\\d-]+${this.breakpoint ? '-' + this.breakpoint : ''}(?![-\\w])`
                );

                // Check if class name pattern already exists.
                if (this.propertyValue.search(regex) >= 0) {
                    newPropertyValue = this.propertyValue.replace(regex, newClassName);
                } else {
                    newPropertyValue = `${this.propertyValue} ${newClassName}`;
                }
            } else {
                newPropertyValue = newClassName;
            }
        }

        const change: IPropertyChange = {
            type: PropertyChangeType.VALUE,
            path: this.propertyPath,
            data: newPropertyValue,
        };
        this.optionChanged.emit(change);
    }

    private _removeVariant(currConfig: IStyleOption, variant: string, propertyValue: string): string {
        let cleanedPropertyValue: string;
        if (!currConfig.value) {
            cleanedPropertyValue = propertyValue
                .split(' ')
                .filter(c => c !== variant)
                .join(' ');
        } else {
            const cc = `${currConfig.value}-`;
            const regex = new RegExp(
                `${cc}${variant}[a-z\\d-]*${this.breakpoint ? '-' + this.breakpoint : ''}(?![-\\w])`
            );
            const stuff = this.propertyValue.search(regex) >= 0;
            cleanedPropertyValue = propertyValue
                .replace(regex, '*')
                .split(' ')
                .filter(c => c !== '*')
                .join(' ');
        }

        const variantOptions = currConfig.variantConfig?.[variant];
        cleanedPropertyValue = variantOptions?.length
            ? variantOptions.reduce(
                  (a, option) =>
                      option.variants.reduce((c, optionVariant) => this._removeVariant(option, optionVariant, c), a),
                  cleanedPropertyValue
              )
            : cleanedPropertyValue;

        return cleanedPropertyValue;
    }

    private _updateSelection(): void {
        if (!this.config.value) {
            this.selectedVariant = this.propertyValue.split(' ').find(curr => this.config.variants.includes(curr));
        } else {
            const regex = new RegExp(
                `(?<=${this.classNamePrefix})[a-z\\d-]+(?=${this.breakpoint ? `-${this.breakpoint}` : '(\\s|$)'})`
            );
            const matches: string[] | null = this.propertyValue?.match(regex);
            this.selectedVariant = matches ? matches[0] : null;
        }

        this.selectedVariantOptions = this.config.variantConfig?.[this.selectedVariant] ?? [];
    }
}
