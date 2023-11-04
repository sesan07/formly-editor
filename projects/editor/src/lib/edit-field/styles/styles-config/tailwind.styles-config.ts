import { BreakpointAffix, ClassProperty, IStyleOptionCategory, IStylesConfig } from '../styles.types';

const numberVariants = [
    '0',
    '0.5',
    '1',
    '1.5',
    '2',
    '2.5',
    '3',
    '3.5',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '14',
    '16',
    '20',
    '24',
    '28',
    '32',
    '36',
    '40',
    '44',
    '48',
    '52',
    '56',
    '60',
    '64',
    '72',
    '80',
    '96',
];

const fractionVariants = [
    '1/2',
    '1/3',
    '2/3',
    '1/4',
    '2/4',
    '3/4',
    '1/5',
    '2/5',
    '3/5',
    '4/5',
    '1/6',
    '2/6',
    '3/6',
    '4/6',
    '5/6',
];
const fractionVariants2 = [
    ...fractionVariants,
    '1/12',
    '2/12',
    '3/12',
    '4/12',
    '5/12',
    '6/12',
    '7/12',
    '8/12',
    '9/12',
    '10/12',
    '11/12',
];

const textVariants = ['px', 'auto'];
const textVariants2 = [...textVariants, 'full', 'screen', 'min', 'max', 'fit'];

const fieldLayout: IStyleOptionCategory = {
    name: 'Layout',
    options: [
        {
            name: 'Column Start',
            value: 'tw-col-start',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'grid',
            },
        },
        {
            name: 'Column Span',
            value: 'tw-col-span',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'grid',
            },
        },
        {
            name: 'Row Start',
            value: 'tw-row-start',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'grid',
            },
        },
        {
            name: 'Row Span',
            value: 'tw-row-span',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'grid',
            },
        },
    ],
};

const fieldSizing: IStyleOptionCategory = {
    name: 'Size',
    options: [
        {
            name: 'Height',
            value: 'tw-h',
            hasBreakpoints: true,
            variants: [...numberVariants, ...fractionVariants, ...textVariants2],
        },
        {
            name: 'Width',
            value: 'tw-w',
            hasBreakpoints: true,
            variants: [...numberVariants, ...fractionVariants2, ...textVariants2],
        },
    ],
};

const fieldMargin: IStyleOptionCategory = {
    name: 'Margin',
    options: [
        {
            name: 'General',
            value: 'tw-m',
            spanWidth: true,
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Horizintal',
            value: 'tw-mx',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Vertical',
            value: 'tw-my',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Top',
            value: 'tw-mt',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Bottom',
            value: 'tw-mb',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Left',
            value: 'tw-ml',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Right',
            value: 'tw-mr',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
    ],
};

const fieldGroupLayout: IStyleOptionCategory = {
    name: 'Layout',
    options: [
        {
            name: 'System',
            variants: ['tw-flex', 'tw-grid'],
            spanWidth: true,
        },
        {
            name: 'Flex Direction',
            value: 'tw-flex',
            variants: ['col', 'col-reverse', 'row', 'row-reverse'],
            dependsOn: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'flex',
            },
            hasBreakpoints: true,
        },
        {
            name: 'Columns',
            value: 'tw-grid-cols',
            variants: ['1', '2', '3'],
            dependsOn: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'grid',
            },
            hasBreakpoints: true,
        },
        {
            name: 'Rows',
            value: 'tw-grid-rows',
            variants: ['1', '2', '3'],
            dependsOn: {
                property: ClassProperty.FIELD_GROUP_CLASS_NAME,
                value: 'grid',
            },
            hasBreakpoints: true,
        },
        {
            name: 'Align Items',
            value: 'tw-items',
            variants: ['start', 'center', 'end'],
            hasBreakpoints: true,
        },
        {
            name: 'Justify Content',
            value: 'tw-justify',
            variants: ['start', 'center', 'end', 'around', 'between', 'evenly'],
            hasBreakpoints: true,
        },
    ],
};

const fieldGroupGap: IStyleOptionCategory = {
    name: 'Gap',
    options: [
        {
            name: 'General',
            value: 'tw-gap',
            spanWidth: true,
            variants: [...numberVariants],
        },
        {
            name: 'Horizontal',
            value: 'tw-gap-x',
            variants: [...numberVariants],
        },
        {
            name: 'Vertical',
            value: 'tw-gap-y',
            variants: [...numberVariants],
        },
    ],
};

const fieldGroupPadding: IStyleOptionCategory = {
    name: 'Padding',
    options: [
        {
            name: 'General',
            value: 'tw-p',
            spanWidth: true,
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Horizintal',
            value: 'tw-px',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Vertical',
            value: 'tw-py',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Top',
            value: 'tw-pt',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Bottom',
            value: 'tw-pb',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Left',
            value: 'tw-pl',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
        {
            name: 'Right',
            value: 'tw-pr',
            hasBreakpoints: true,
            variants: [...numberVariants, ...textVariants],
        },
    ],
};

export const tailwindConfig: IStylesConfig = {
    breakpointAffix: BreakpointAffix.PREFIX,
    breakpoints: [
        {
            name: 'All Devices',
            description: 'All devices',
            value: '',
        },
        {
            name: 'Small Devices',
            description: 'Portrait tablets and large phones, 600px and up',
            value: 'sm:',
        },
        {
            name: 'Medium Devices',
            description: 'Landscape tablets, 768px and up',
            value: 'md:',
        },
        {
            name: 'Large Devices',
            description: 'Laptops/desktops, 992px and up',
            value: 'lg:',
        },
        {
            name: 'Extra-large Devices',
            description: 'Large laptops and desktops, 1200px and up',
            value: 'xl:',
        },
    ],
    className: [fieldLayout, fieldSizing, fieldMargin],
    fieldGroupClassName: [fieldGroupLayout, fieldGroupGap, fieldGroupPadding],
};
