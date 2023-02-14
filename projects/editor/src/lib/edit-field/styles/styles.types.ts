export enum ClassProperty {
    CLASS_NAME = 'className',
    FIELD_GROUP_CLASS_NAME = 'fieldGroupClassName',
}

export enum BreakpointAffix {
    PREFIX = 'prefix',
    SUFFIX = 'suffix',
}

interface IStyleDependency {
    property: ClassProperty;
    value: string;
}

export interface IStyleOption {
    name: string;
    value?: string;
    variants: string[];
    hasBreakpoints?: boolean;
    spanWidth?: boolean;
    dependsOn?: IStyleDependency;
    dependsOnParent?: IStyleDependency;
}

export interface IStylesConfig {
    breakpointAffix: BreakpointAffix;
    breakpoints: IBreakpoint[];
    className: IStyleOptionCategory[];
    fieldGroupClassName: IStyleOptionCategory[];
}

export interface IStyleOptionCategory {
    name: string;
    options: IStyleOption[];
}

export interface IBreakpoint {
    name: string;
    description: string;
    value: string;
}
