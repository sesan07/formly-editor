export interface IStyleOption {
    name: string;
    value?: string;
    variants: string[];
    variantConfig?: Record<string, IStyleOption[]>;
    hasBreakpoints?: boolean;
    dependsOnParent?: {
        property: 'className' | 'fieldGroupClassName';
        value: string;
    };
}
