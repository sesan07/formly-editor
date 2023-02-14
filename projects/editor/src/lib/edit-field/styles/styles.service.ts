import { Injectable } from '@angular/core';
import { defaultConfig } from './styles.config';

import {
    BreakpointAffix,
    ClassProperty,
    IBreakpoint,
    IStyleOption,
    IStyleOptionCategory,
    IStylesConfig,
} from './styles.types';

@Injectable({
    providedIn: 'root',
})
export class StylesService {
    stylesConfig: IStylesConfig = defaultConfig;
    classNames: string[];
    fieldGroupClassNames: string[];

    constructor() {
        this.classNames = this._getPropertyClasses(ClassProperty.CLASS_NAME);
        this.fieldGroupClassNames = this._getPropertyClasses(ClassProperty.FIELD_GROUP_CLASS_NAME);
    }

    getClasses(categories: IStyleOptionCategory[], breakpoint: IBreakpoint): string[] {
        return categories.reduce(
            (a, category) => [
                ...a,
                ...category.options.reduce(
                    (b, option) => [...b, ...this._getOptionClasses(option, breakpoint.value)],
                    []
                ),
            ],
            []
        );
    }

    private _getOptionClasses(option: IStyleOption, breakpoint: string): string[] {
        const classes =
            !breakpoint || option.hasBreakpoints
                ? option.variants.map(
                      variant =>
                          `${this.stylesConfig.breakpointAffix === BreakpointAffix.PREFIX ? breakpoint : ''}${
                              option.value ? `${option.value}-` : ''
                          }${variant}${this.stylesConfig.breakpointAffix === BreakpointAffix.SUFFIX ? breakpoint : ''}`
                  )
                : [];

        return classes;
    }

    private _getPropertyClasses(classProperty: ClassProperty): string[] {
        return this.stylesConfig.breakpoints.reduce(
            (a, breakpoint) => [...a, ...this.getClasses(this.stylesConfig[classProperty], breakpoint)],
            []
        );
    }
}
