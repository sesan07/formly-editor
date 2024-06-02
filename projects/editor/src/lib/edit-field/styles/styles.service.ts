import { Injectable } from '@angular/core';

import { tailwindConfig } from './styles-config/tailwind.styles-config';
import { ClassProperty, IBreakpoint, IStyleOption, IStyleOptionCategory, IStylesConfig } from './styles.types';
import { formatVariant } from './styles.utils';

@Injectable({
    providedIn: 'root',
})
export class StylesService {
    stylesConfig: IStylesConfig;
    classNames: string[];
    fieldGroupClassNames: string[];

    setup(stylesConfig?: IStylesConfig): void {
        this.stylesConfig = stylesConfig ?? tailwindConfig;
        this.classNames = this._getPropertyClasses(ClassProperty.CLASS_NAME);
        this.fieldGroupClassNames = this._getPropertyClasses(ClassProperty.FIELD_GROUP_CLASS_NAME);
    }

    getClasses(categories: IStyleOptionCategory[], breakpoint: IBreakpoint): string[] {
        return categories.reduce(
            (a, category) => [
                ...a,
                ...category.options.reduce((b, option) => [...b, ...this._getOptionClasses(option, breakpoint)], []),
            ],
            []
        );
    }

    private _getOptionClasses(option: IStyleOption, breakpoint: IBreakpoint): string[] {
        const classes =
            !breakpoint.value || option.hasBreakpoints
                ? option.variants.map(variant =>
                      formatVariant(variant, option, breakpoint, this.stylesConfig.breakpointAffix)
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
