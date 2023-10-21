import { BreakpointAffix, IStyleOptionCategory, IStylesConfig } from '../styles.types';

const numberVariants = ['1', '2', '3', '4', '5'];
const numberVariants2 = [...numberVariants, '6', '7', '8', '9', '10', '11', '12'];

const sizingVariants = ['25', '50', '75', '100', 'auto'];
const spacingVariants = [...numberVariants, 'auto'];

const fieldLayout: IStyleOptionCategory = {
    name: 'Layout',
    options: [
        {
            name: 'Columns',
            value: 'col',
            variants: numberVariants2,
            hasBreakpoints: true,
            spanWidth: true,
        },
        {
            name: 'Rows',
            value: 'row',
            variants: numberVariants2,
            hasBreakpoints: true,
            spanWidth: true,
        },
    ],
};

const fieldSizing: IStyleOptionCategory = {
    name: 'Size',
    options: [
        {
            name: 'Height',
            value: 'h',
            hasBreakpoints: true,
            variants: sizingVariants,
        },
        {
            name: 'Width',
            value: 'w',
            hasBreakpoints: true,
            variants: sizingVariants,
        },
    ],
};

const fieldMargin: IStyleOptionCategory = {
    name: 'Margin',
    options: [
        {
            name: 'General',
            value: 'm',
            spanWidth: true,
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Horizintal',
            value: 'mx',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Vertical',
            value: 'my',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Top',
            value: 'mt',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Bottom',
            value: 'mb',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Left',
            value: 'ml',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Right',
            value: 'mr',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
    ],
};

const fieldGroupLayout: IStyleOptionCategory = {
    name: 'Layout',
    options: [
        {
            name: 'System',
            variants: ['container', 'col', 'row'],
            spanWidth: true,
        },
        {
            name: 'Align Items',
            value: 'align-items',
            variants: ['start', 'center', 'end'],
            hasBreakpoints: true,
        },
        {
            name: 'Justify Content',
            value: 'justify-content',
            variants: ['start', 'center', 'end', 'around', 'between', 'evenly'],
            hasBreakpoints: true,
        },
    ],
};

const fieldGroupGutters: IStyleOptionCategory = {
    name: 'Gutters',
    options: [
        {
            name: 'General',
            value: 'g',
            spanWidth: true,
            hasBreakpoints: true,
            variants: [...numberVariants],
        },
        {
            name: 'Horizontal',
            value: 'gx',
            hasBreakpoints: true,
            variants: [...numberVariants],
        },
        {
            name: 'Vertical',
            value: 'gy',
            hasBreakpoints: true,
            variants: [...numberVariants],
        },
    ],
};

const fieldGroupPadding: IStyleOptionCategory = {
    name: 'Padding',
    options: [
        {
            name: 'General',
            value: 'p',
            spanWidth: true,
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Horizintal',
            value: 'px',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Vertical',
            value: 'py',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Top',
            value: 'pt',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Bottom',
            value: 'pb',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Left',
            value: 'pl',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
        {
            name: 'Right',
            value: 'pr',
            hasBreakpoints: true,
            variants: spacingVariants,
        },
    ],
};

export const bootstrapConfig: IStylesConfig = {
    breakpointAffix: BreakpointAffix.INFIX,
    breakpoints: [
        {
            name: 'All Devices',
            description: 'All devices',
            value: '',
        },
        {
            name: 'Small Devices',
            description: 'Portrait tablets and large phones, 576px and up',
            value: 'sm',
        },
        {
            name: 'Medium Devices',
            description: 'Landscape tablets, 768px and up',
            value: 'md',
        },
        {
            name: 'Large Devices',
            description: 'Laptops/desktops, 992px and up',
            value: 'lg',
        },
        {
            name: 'Extra-large Devices',
            description: 'Large laptops and desktops, 1200px and up',
            value: 'xl',
        },
    ],
    className: [fieldLayout, fieldSizing, fieldMargin],
    fieldGroupClassName: [fieldGroupLayout, fieldGroupGutters, fieldGroupPadding],
};
