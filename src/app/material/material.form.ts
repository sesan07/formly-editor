import { FormlyFieldConfig } from '@ngx-formly/core';
import { IDefaultForm } from '@sesan07/ngx-formly-editor';

const fields: FormlyFieldConfig[] = [
    {
        type: 'formly-group',
        fieldGroup: [
            {
                type: 'formly-group',
                fieldGroup: [
                    {
                        type: 'input',
                        wrappers: ['form-field'],
                        props: {
                            label: 'Label',
                            placeholder: 'Placeholder',
                            description: 'Description',
                            required: true,
                        },
                        key: 'input',
                    },
                    {
                        type: 'number',
                        wrappers: ['form-field'],
                        props: {
                            label: 'Label',
                            placeholder: 'Placeholder',
                            description: 'Description',
                            required: true,
                            type: 'number',
                        },
                        key: 'num',
                    },
                    {
                        type: 'textarea',
                        wrappers: ['form-field'],
                        props: {
                            label: 'Label',
                            placeholder: 'Placeholder',
                            description: 'Description',
                            required: true,
                        },
                        key: 'textarea',
                        className: 'tw-col-span-2',
                    },
                ],
                fieldGroupClassName: 'tw-grid tw-grid-cols-2 tw-gap-2',
                key: 'card',
                wrappers: ['card'],
                props: {
                    cardTitle: 'Card!',
                },
            },
            {
                type: 'repeating-section',
                templateOptions: {
                    addText: 'Add Section',
                },
                fieldArray: {
                    type: 'formly-group',
                    fieldGroup: [
                        {
                            type: 'radio',
                            wrappers: ['form-field'],
                            props: {
                                label: 'Label',
                                placeholder: 'Placeholder',
                                description: 'Description',
                                required: true,
                                options: [
                                    {
                                        value: 1,
                                        label: 'Option 1',
                                    },
                                    {
                                        value: 2,
                                        label: 'Option 2',
                                    },
                                    {
                                        value: 3,
                                        label: 'Option 3',
                                    },
                                    {
                                        value: 4,
                                        label: 'Option 4',
                                        disabled: true,
                                    },
                                ],
                            },
                            key: 'radio',
                        },
                        {
                            type: 'select',
                            wrappers: ['form-field'],
                            props: {
                                label: 'Label',
                                placeholder: 'Placeholder',
                                description: 'Description',
                                required: true,
                                multiple: true,
                                selectAllOption: 'Select All',
                                options: [
                                    {
                                        value: 1,
                                        label: 'Option 1',
                                    },
                                    {
                                        value: 2,
                                        label: 'Option 2',
                                    },
                                    {
                                        value: 3,
                                        label: 'Option 3',
                                    },
                                    {
                                        value: 4,
                                        label: 'Option 4',
                                        disabled: true,
                                    },
                                ],
                            },
                            key: 'select',
                        },
                    ],
                    fieldGroupClassName: 'tw-grid tw-grid-cols-2 tw-gap-x-2',
                },
                key: 'repeat',
            },
        ],
        key: 'group',
        fieldGroupClassName: 'tw-flex tw-flex-col tw-gap-y-2',
    },
    {
        type: 'checkbox',
        wrappers: ['form-field'],
        props: {
            label: 'Accept terms',
            description: 'In order to proceed, please accept terms',
            pattern: 'true',
            required: true,
        },
        validation: {
            messages: {
                pattern: 'Please accept the terms',
            },
        },
        key: 'checkbox',
        className: 'tw-mt-2',
    },
];

const model: Record<string, unknown> = {
    group: {
        card: {
            input: 'Hello!',
            num: 321,
            textarea: 'Bye!',
        },
        repeat: [
            {
                radio: 2,
                select: [1, 3],
            },
            {
                radio: 1,
                select: [2],
            },
        ],
    },
    checkbox: true,
};

export const defaultForm: IDefaultForm = {
    name: 'Material Form Zero',
    fields,
    model,
};
