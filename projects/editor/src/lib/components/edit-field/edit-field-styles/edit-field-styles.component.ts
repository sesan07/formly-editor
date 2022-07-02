import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EditorService } from '../../../services/editor-service/editor.service';
import { IEditorFormlyField } from '../../../services/editor-service/editor.types';
import { StyleService } from '../../../services/style-service/style.service';
import { ContainerType, BreakpointType, GridChildPrefix, GridContainerPrefix, FlexContainerPrefix } from '../../../services/style-service/style.types';
import { IChipListProperty } from '../../property/chip-list-property/chip-list-property.types';
import { PropertyType } from '../../property/property.types';

@Component({
    selector: 'lib-edit-field-styles',
    templateUrl: './edit-field-styles.component.html',
    styleUrls: ['./edit-field-styles.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditFieldStylesComponent implements OnChanges {
    @Input() editField: IEditorFormlyField;

    @Output() fieldChanged: EventEmitter<void> = new EventEmitter();

    containerType: typeof ContainerType = ContainerType;
    containerTypes: ContainerType[] = Object.values(ContainerType);

    flexContainerPrefixes: FlexContainerPrefix[] = Object.values(FlexContainerPrefix);
    gridContainerPrefixes: GridContainerPrefix[] = Object.values(GridContainerPrefix);
    gridChildPrefixes: GridChildPrefix[] = Object.values(GridChildPrefix);

    breakpointTypes: BreakpointType[] = Object.values(BreakpointType);

    parentContainer: ContainerType;
    childrenContainer: ContainerType;

    public flexOptions: string[] = ['column', 'column-reverse', 'row', 'row-reverse'];
    public gridNumberOptions: string[] = [...Array(3).keys()].map(i => i + 1 + '');

    private _generalProperty: IChipListProperty;
    private _breakpointProperties: Map<BreakpointType, IChipListProperty> = new Map();

    private _generalChildrenProperty: IChipListProperty;
    private _breakpointChildrenProperties: Map<BreakpointType, IChipListProperty> = new Map();

    constructor(private _editorService: EditorService, private _styleService: StyleService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.editField) {
            return;
        }

        this._setupProperties();

        if (this.editField.parentFieldId) {
            this._setupParent();
        }

        if (this.editField.canHaveChildren) {
            this._setupChildren();
            this._setupChildrenProperties();
        }
    }

    onChildrenContainerChanged(value: string): void {
        let newFieldGroupClassName: string;
        if (this.editField.fieldGroupClassName) {
            if (this.childrenContainer) {
                newFieldGroupClassName = this.editField.fieldGroupClassName.replace(
                    new RegExp(`(?<!-)${this.childrenContainer}(?!-)`),
                    value
                );
            } else {
                newFieldGroupClassName = value +  ' ' + this.editField.fieldGroupClassName;
            }
        } else {
            newFieldGroupClassName = value;
        }
        // TODO remove related group styles (flex-direction, grid-cols...) arr.split(' ').filter(!contains prevType).join(' ')
        this.childrenContainer = value as ContainerType;
        this.editField.fieldGroupClassName = newFieldGroupClassName;
        this.fieldChanged.emit();
    }

    onClassChanged(value: string, classNamePrefix: string, breakpoint?: BreakpointType): void {
        this._setClassValue('className', value, classNamePrefix, breakpoint);
    }

    onChildrenClassChanged(value: string, classNamePrefix: string, breakpoint?: BreakpointType): void {
        this._setClassValue('fieldGroupClassName', value, classNamePrefix, breakpoint);
    }

    getBreakpointTitle(breakpointType: BreakpointType): string {
        switch(breakpointType) {
            case BreakpointType.SMALL: return 'Small devices';
            case BreakpointType.MEDIUM: return 'Medium devices';
            case BreakpointType.LARGE: return 'Large devices';
            case BreakpointType.EXTRA_LARGE: return 'Extra large devices';
            default: throw new Error('Unknown breakpoint');
        }
    }

    getBreakpointTooltip(breakpointType: BreakpointType): string {
        switch(breakpointType) {
            case BreakpointType.SMALL: return 'Portrait tablets and large phones, 600px and up';
            case BreakpointType.MEDIUM: return 'Landscape tablets, 768px and up';
            case BreakpointType.LARGE: return 'Laptops/desktops, 992px and up';
            case BreakpointType.EXTRA_LARGE: return 'Large laptops and desktops, 1200px and up';
            default: throw new Error('Unknown breakpoint');
        }
    }

    getContainerName(groupStyle: ContainerType): string {
        switch (groupStyle) {
            case ContainerType.FLEX: return 'Flex';
            case ContainerType.GRID: return 'Grid';
        }
    }

    getNameFromPrefix(prefix: string): string {
        switch (prefix) {
            case GridContainerPrefix.COLUMNS: return 'Number of Columns';
            case GridContainerPrefix.ROWS: return 'Number of Rows';
            case GridChildPrefix.COLUMN_SPAN: return 'Column Span';
            case GridChildPrefix.COLUMN_START: return 'Column Start';
            case GridChildPrefix.ROW_SPAN: return 'Row Span';
            case GridChildPrefix.ROW_START: return 'Row Start';
            case FlexContainerPrefix.FLEX_DIRECTION: return 'Flex Direction';
        }
    }

    getClassValue(classNamePrefix: string, breakpoint?: BreakpointType): string {
        return this._getClassValue('className', classNamePrefix, breakpoint);
    }

    getChildrenClassValue(classNamePrefix: string, breakpoint?: BreakpointType): string {
        return this._getClassValue('fieldGroupClassName', classNamePrefix, breakpoint);
    }

    getProperty(breakpoint?: BreakpointType): IChipListProperty {
        return breakpoint ? this._breakpointProperties.get(breakpoint) : this._generalProperty;
    }

    getChildrenProperty(breakpoint?: BreakpointType): IChipListProperty {
        return breakpoint ? this._breakpointChildrenProperties.get(breakpoint) : this._generalChildrenProperty;
    }

    private _setupParent(): void {
        const parent: IEditorFormlyField = this._editorService.getField(this.editField.formId, this.editField.parentFieldId);
        const fieldGroupClassNames: string[] = parent.fieldGroupClassName?.split(' ') ?? [];

        // TODO use regex to match without '-' prefix and suffix
        this.parentContainer = fieldGroupClassNames.find(
            className => (this.containerTypes as string[]).includes(className)
        ) as ContainerType;
    }

    private _setupChildren(): void {
        const fieldGroupClassNames: string[] = this.editField.fieldGroupClassName?.split(' ') ?? [];

        // TODO use regex to match without '-' prefix and suffix
        this.childrenContainer = fieldGroupClassNames.find(className =>
            (this.containerTypes as string[]).includes(className)
        ) as ContainerType;
    }

    private _setupProperties(): void {
        this._generalProperty = this._getProperty('className');

        this.breakpointTypes.forEach(breakpoint => {
            this._breakpointProperties.set(breakpoint, this._getProperty('className', breakpoint));
        });
    }

    private _setupChildrenProperties(): void {
        this._generalChildrenProperty = this._getProperty('fieldGroupClassName');

        this.breakpointTypes.forEach(breakpoint => {
            this._breakpointChildrenProperties.set(breakpoint, this._getProperty('fieldGroupClassName', breakpoint));
        });
    }

    private _setClassValue(property: string, value: string, classNamePrefix: string, breakpoint?: BreakpointType): void {
        const newClassName: string = classNamePrefix + value + (breakpoint ? '-' + breakpoint : '');
        let newPropertyValue: string;

        if (this.editField[property]) {
            const regex = new RegExp(`${classNamePrefix}[a-zA-Z\\d-]+${breakpoint ? ('-' + breakpoint) : ''}(?![-\\w])`);

            // Check if class name pattern already exists.
            if (this.editField[property].search(regex) >= 0) {
                newPropertyValue = (this.editField[property] as string).replace(regex, newClassName);
            } else {
                newPropertyValue = this.editField[property] + ' ' + newClassName;
            }
        } else {
            newPropertyValue = newClassName;
        }
        // TODO remove related group styles (flex-direction, grid-cols...) arr.split(' ').filter(!contains prevType).join(' ')
        this.editField[property] = newPropertyValue
        this.fieldChanged.emit();
    }

    private _getClassValue(property: string, classNamePrefix: string, breakpoint?: BreakpointType): string {
        const regex = new RegExp(`(?<=${classNamePrefix})[a-zA-Z\\d]+(-reverse){0,1}(?=${breakpoint ? `-${breakpoint}` : '(\\s|$)'})`);
        const matches: string[] | null = this.editField[property]?.match(regex);
        return matches ? matches[0] : null;
    }

    private _getProperty(key: string, breakpoint?: BreakpointType): IChipListProperty {
        return {
            key,
            name: 'Custom classes',
            type: PropertyType.CHIP_LIST,
            options: this._styleService.getBreakpointClassNames(breakpoint),
            hiddenOptions: this._styleService.containerClassNames$,
            outputString: true,
            isSimple: true,
        };
    }
}
