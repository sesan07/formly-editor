import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';

import { IEditorFormlyField } from '../../editor.types';
import { FormService } from '../../form/form.service';
import { IChipListProperty } from '../../property/chip-list-property/chip-list-property.types';
import { IPropertyChange, PropertyType } from '../../property/property.types';
import { IStyleOption } from './style-option/style-option.types';
import { defaultConfig } from './styles.config';
import { StylesService } from './styles.service';
import { ContainerType, BreakpointType, IStylingConfig } from './styles.types';

@Component({
    selector: 'editor-styles',
    templateUrl: './styles.component.html',
    styleUrls: ['./styles.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StylesComponent implements OnChanges {
    @Input() editField: IEditorFormlyField;

    @Output() fieldChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    stylingConfig: IStylingConfig = defaultConfig;

    parentContainer: ContainerType;
    parentField?: IEditorFormlyField;

    typeOfContainer: typeof ContainerType = ContainerType;
    containerTypes: ContainerType[] = Object.values(ContainerType);

    typeOfBreakpoint: typeof BreakpointType = BreakpointType;
    breakpointTypes: BreakpointType[] = Object.values(BreakpointType);

    private _breakpointProperties: Map<BreakpointType, IChipListProperty> = new Map();
    private _breakpointChildrenProperties: Map<BreakpointType, IChipListProperty> = new Map();

    constructor(private _formService: FormService, private _stylesService: StylesService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.editField) {
            this._setUp();
        }
    }

    canShowOption(config: IStyleOption): boolean {
        if (config.dependsOnParent) {
            const propertyValue = this.parentField?.[config.dependsOnParent.property] ?? '';
            return propertyValue.split(' ').includes(config.dependsOnParent.value);
        }
        return true;
    }

    getBreakpointTitle(breakpointType: BreakpointType): string {
        switch (breakpointType) {
            case BreakpointType.ALL:
                return 'All devices';
            case BreakpointType.SMALL:
                return 'Small devices';
            case BreakpointType.MEDIUM:
                return 'Medium devices';
            case BreakpointType.LARGE:
                return 'Large devices';
            case BreakpointType.EXTRA_LARGE:
                return 'Extra large devices';
            default:
                throw new Error('Unknown breakpoint');
        }
    }

    getBreakpointTooltip(breakpointType: BreakpointType): string {
        switch (breakpointType) {
            case BreakpointType.ALL:
                return 'All devices';
            case BreakpointType.SMALL:
                return 'Portrait tablets and large phones, 600px and up';
            case BreakpointType.MEDIUM:
                return 'Landscape tablets, 768px and up';
            case BreakpointType.LARGE:
                return 'Laptops/desktops, 992px and up';
            case BreakpointType.EXTRA_LARGE:
                return 'Large laptops and desktops, 1200px and up';
            default:
                throw new Error('Unknown breakpoint');
        }
    }

    getContainerName(groupStyle: ContainerType): string {
        switch (groupStyle) {
            case ContainerType.FLEX:
                return 'Flex';
            case ContainerType.GRID:
                return 'Grid';
        }
    }

    getProperty(breakpoint: BreakpointType): IChipListProperty {
        return this._breakpointProperties.get(breakpoint);
    }

    getChildrenProperty(breakpoint: BreakpointType): IChipListProperty {
        return this._breakpointChildrenProperties.get(breakpoint);
    }

    private _setUp(): void {
        this._setupProperties();
        this._setupParent();

        if (this.editField._info.canHaveChildren) {
            this._setupChildrenProperties();
        }
    }

    private _setupParent(): void {
        this.parentField = this._formService.getField(this.editField._info.parentFieldId);
        if (!this.parentField) {
            this.parentContainer = null;
            return;
        }

        const fieldGroupClassNames: string[] = this.parentField.fieldGroupClassName?.split(' ') ?? [];

        // TODO use regex to match without '-' prefix and suffix
        this.parentContainer = fieldGroupClassNames.find(className =>
            (this.containerTypes as string[]).includes(className)
        ) as ContainerType;
    }

    private _setupProperties(): void {
        this.breakpointTypes.forEach(breakpoint => {
            this._breakpointProperties.set(breakpoint, this._getProperty('className', breakpoint));
        });
    }

    private _setupChildrenProperties(): void {
        this.breakpointTypes.forEach(breakpoint => {
            this._breakpointChildrenProperties.set(breakpoint, this._getProperty('fieldGroupClassName', breakpoint));
        });
    }

    private _getProperty(key: string, breakpoint?: BreakpointType): IChipListProperty {
        return {
            key,
            name: 'Custom classes',
            type: PropertyType.CHIP_LIST,
            options: this._stylesService.getBreakpointClassNames(breakpoint),
            outputString: true,
            isSimple: true,
        };
    }
}
