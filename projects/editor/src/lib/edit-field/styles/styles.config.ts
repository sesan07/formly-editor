import { IStylingConfig } from './styles.types';

export const defaultConfig: IStylingConfig = {
    className: [
        {
            name: 'Column Start',
            value: 'col-start',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: 'fieldGroupClassName',
                value: 'grid',
            },
        },
        {
            name: 'Column Span',
            value: 'col-span',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: 'fieldGroupClassName',
                value: 'grid',
            },
        },
        {
            name: 'Row Start',
            value: 'row-start',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: 'fieldGroupClassName',
                value: 'grid',
            },
        },
        {
            name: 'Row Span',
            value: 'row-span',
            variants: ['1', '2', '3'],
            hasBreakpoints: true,
            dependsOnParent: {
                property: 'fieldGroupClassName',
                value: 'grid',
            },
        },
    ],
    fieldGroupClassName: [
        {
            name: 'Container Type',
            variants: ['flex', 'grid'],
            variantConfig: {
                flex: [
                    {
                        name: 'Flex Direction',
                        value: 'flex',
                        variants: ['column', 'column-reverse', 'row', 'row-reverse'],
                        hasBreakpoints: true,
                    },
                ],
                grid: [
                    {
                        name: 'Columns',
                        value: 'grid-cols',
                        variants: ['1', '2', '3'],
                        hasBreakpoints: true,
                    },
                    {
                        name: 'Rows',
                        value: 'grid-rows',
                        variants: ['1', '2', '3'],
                        hasBreakpoints: true,
                    },
                ],
            },
        },
    ],
};
