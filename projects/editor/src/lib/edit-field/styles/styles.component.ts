import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TrackByFunction,
} from '@angular/core';

import { IEditorFormlyField } from '../../editor.types';
import { IChipListProperty } from '../../property/chip-list-property/chip-list-property.types';
import { IPropertyChange, PropertyType } from '../../property/property.types';
import { StylesService } from './styles.service';
import { IStylesConfig, ClassProperty, IBreakpoint, IStyleOptionCategory, IStyleOption } from './styles.types';

@Component({
    selector: 'editor-styles',
    templateUrl: './styles.component.html',
    styleUrls: ['./styles.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StylesComponent implements OnChanges, OnInit {
    @Input() editField: IEditorFormlyField;
    @Input() parentField: IEditorFormlyField;

    @Output() fieldChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    tabIndex = 0;

    stylesConfig: IStylesConfig = this._stylesService.stylesConfig;

    typeOfClassProperty: typeof ClassProperty = ClassProperty;
    classNameProperties: Record<string, IChipListProperty>; // <breakpoint, property>
    fieldGroupClassNameProperties: Record<string, IChipListProperty>;

    classNameCategories: Record<string, IStyleOptionCategory[]>; // <breakpoint, category>
    fieldGroupClassNameCategories: Record<string, IStyleOptionCategory[]>;

    allClassNameCategories: IStyleOptionCategory[];
    allFieldGroupClassNameCategories: IStyleOptionCategory[];

    constructor(private _stylesService: StylesService) {}

    trackByName: TrackByFunction<IStyleOptionCategory> = (_, category) => category.name;
    trackByOptionName: TrackByFunction<IStyleOption> = (_, option) => option.name;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.editField && !changes.editField.firstChange) {
            this._setupCategories();
        }
    }

    ngOnInit(): void {
        this._setupProperties();
        this._setupCategories();
    }

    getCategories(
        property: ClassProperty,
        breakpoint: IBreakpoint = this.stylesConfig.breakpoints[0]
    ): IStyleOptionCategory[] {
        if (property === ClassProperty.CLASS_NAME) {
            return this.classNameCategories?.[breakpoint.value];
        } else if (property === ClassProperty.FIELD_GROUP_CLASS_NAME) {
            return this.fieldGroupClassNameCategories?.[breakpoint.value];
        }
    }

    getChipListProperty(property: ClassProperty, breakpoint: IBreakpoint): IChipListProperty {
        if (property === ClassProperty.CLASS_NAME) {
            return this.classNameProperties[breakpoint.value];
        } else if (property === ClassProperty.FIELD_GROUP_CLASS_NAME) {
            return this.fieldGroupClassNameProperties[breakpoint.value];
        }
    }

    private _setupCategories(): void {
        this.classNameCategories = this._getCategoryMap(ClassProperty.CLASS_NAME);
        this.fieldGroupClassNameCategories = this._getCategoryMap(ClassProperty.FIELD_GROUP_CLASS_NAME);

        const defaultBreakpoint = this.stylesConfig.breakpoints[0];
        this.allClassNameCategories = this.classNameCategories[defaultBreakpoint.value];
        this.allFieldGroupClassNameCategories = this.fieldGroupClassNameCategories[defaultBreakpoint.value];

        if (!this.editField?._info.canHaveChildren) {
            this.tabIndex = 0;
        }
    }

    private _setupProperties(): void {
        this.classNameProperties = this._getPropertyMap(ClassProperty.CLASS_NAME);
        this.fieldGroupClassNameProperties = this._getPropertyMap(ClassProperty.FIELD_GROUP_CLASS_NAME);
    }

    private _canShowOption(option: IStyleOption, breakpoint: IBreakpoint): boolean {
        if (breakpoint.value && !option.hasBreakpoints) {
            return false;
        }

        const regexp = (val: string) => new RegExp(`(?<=(\\s|^))${val}(?=(\\s|$))`);
        if (option.dependsOnParent) {
            const { property, value } = option.dependsOnParent;
            const match = (this.parentField?.[property] ?? '').match(regexp(value));
            if (!match) {
                return false;
            }
        }
        if (option.dependsOn) {
            const { property, value } = option.dependsOn;
            const match = (this.editField?.[property] ?? '').match(regexp(value));
            if (!match) {
                return false;
            }
        }

        return true;
    }

    private _getCategoryMap(classProperty: ClassProperty): Record<string, IStyleOptionCategory[]> {
        return this.stylesConfig.breakpoints.reduce(
            (a, breakpoint) => ({
                ...a,
                [breakpoint.value]: this.stylesConfig[classProperty].map(category => ({
                    ...category,
                    options: category.options.filter(option => this._canShowOption(option, breakpoint)),
                })),
            }),
            {}
        );
    }

    private _getPropertyMap(classProperty: ClassProperty): Record<string, IChipListProperty> {
        return this.stylesConfig.breakpoints.reduce((a, breakpoint) => {
            const classes = this._stylesService.getClasses(this.stylesConfig[classProperty], breakpoint);
            const p = this._getChipListProperty(classProperty, classes);
            return {
                ...a,
                [breakpoint.value]: p,
            };
        }, {});
    }

    private _getChipListProperty(key: string, options: string[]): IChipListProperty {
        return {
            key,
            options,
            name: 'Custom classes',
            type: PropertyType.CHIP_LIST,
            outputString: true,
            isSimple: true,
        };
    }
}
