import {
    EditorConfig,
    FieldTypeOption,
    FieldWrapperOption,
    ValidatorOption,
    createArrayProperty,
    createBooleanProperty,
    createObjectProperty,
    createSelectProperty,
    createTextProperty,
} from '@sesan07/ngx-formly-editor';

import { defaultForm } from './material.form';

export const inputTypeConfig: FieldTypeOption = {
    displayName: 'Input',
    name: 'input',
    keyGenerationPrefix: 'inp',
    defaultConfig: {
        wrappers: ['form-field'],
        props: {
            label: 'Label',
            placeholder: 'Placeholder',
            description: 'Description',
            required: true,
        },
    },
    properties: [
        createSelectProperty({
            name: 'Type',
            key: 'props.type',
            options: [
                {
                    label: 'Number',
                    value: 'number',
                },
                {
                    label: 'Text',
                    value: 'text',
                },
            ],
        }),
    ],
};

export const numberTypeConfig: FieldTypeOption = {
    displayName: 'Number',
    name: 'number',
    keyGenerationPrefix: 'num',
    defaultConfig: {
        wrappers: ['form-field'],
        props: {
            type: 'number',
            label: 'Label',
            placeholder: 'Placeholder',
            description: 'Description',
            required: true,
        },
    },
};

export const checkboxTypeConfig: FieldTypeOption = {
    displayName: 'Checkbox',
    name: 'checkbox',
    keyGenerationPrefix: 'chk',
    defaultConfig: {
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
    },
    properties: [
        createTextProperty({
            name: 'Pattern',
            key: 'props.pattern',
        }),
    ],
};

export const radioTypeConfig: FieldTypeOption = {
    displayName: 'Radio',
    name: 'radio',
    keyGenerationPrefix: 'rad',
    defaultConfig: {
        wrappers: ['form-field'],
        props: {
            label: 'Label',
            placeholder: 'Placeholder',
            description: 'Description',
            required: true,
            options: [
                { value: 1, label: 'Option 1' },
                { value: 2, label: 'Option 2' },
                { value: 3, label: 'Option 3' },
                { value: 4, label: 'Option 4', disabled: true },
            ],
        },
    },
    properties: [
        createArrayProperty({
            name: 'Options',
            key: 'props.options',
            canAdd: true,
            childProperty: createObjectProperty({
                isRemovable: true,
                childProperties: [
                    createTextProperty({
                        name: 'Label',
                        key: 'label',
                    }),
                    createTextProperty({
                        name: 'Value',
                        key: 'value',
                        outputRawValue: true,
                    }),
                    createBooleanProperty({
                        name: 'Disabled',
                        key: 'disabled',
                    }),
                ],
            }),
        }),
    ],
};

export const selectTypeConfig: FieldTypeOption = {
    displayName: 'Select',
    name: 'select',
    keyGenerationPrefix: 'sel',
    defaultConfig: {
        wrappers: ['form-field'],
        props: {
            label: 'Label',
            placeholder: 'Placeholder',
            description: 'Description',
            required: true,
            multiple: true,
            selectAllOption: 'Select All',
            options: [
                { value: 1, label: 'Option 1' },
                { value: 2, label: 'Option 2' },
                { value: 3, label: 'Option 3' },
                { value: 4, label: 'Option 4', disabled: true },
            ],
        },
    },
    properties: [
        createTextProperty({
            name: 'Select all options label',
            key: 'props.selectAllOption',
        }),
        createBooleanProperty({
            name: 'Multiple selections',
            key: 'props.multiple',
        }),
        createArrayProperty({
            name: 'Options',
            key: 'props.options',
            canAdd: true,
            childProperty: createObjectProperty({
                isRemovable: true,
                childProperties: [
                    createTextProperty({
                        name: 'Label',
                        key: 'label',
                    }),
                    createTextProperty({
                        name: 'Value',
                        key: 'value',
                        outputRawValue: true,
                    }),
                    createBooleanProperty({
                        name: 'Disabled',
                        key: 'disabled',
                    }),
                ],
            }),
        }),
    ],
};

export const textareaTypeConfig: FieldTypeOption = {
    displayName: 'Textarea',
    name: 'textarea',
    keyGenerationPrefix: 'txt',
    defaultConfig: {
        wrappers: ['form-field'],
        props: {
            label: 'Label',
            placeholder: 'Placeholder',
            description: 'Description',
            required: true,
        },
    },
};

export const groupTypeConfig: FieldTypeOption = {
    displayName: 'Group',
    name: 'formly-group',
    disableKeyGeneration: true,
    childrenConfig: {
        path: 'fieldGroup',
    },
    defaultConfig: {
        fieldGroup: [],
    },
};

const repeatTypeConfig: FieldTypeOption = {
    displayName: 'Repeating Section',
    name: 'repeating-section',
    keyGenerationPrefix: 'rep',
    childrenConfig: {
        path: 'fieldArray',
        isObject: true,
    },
    defaultConfig: {
        props: {
            addText: 'Add Section',
        },
        fieldArray: {
            fieldGroup: [],
        },
    },
    properties: [
        createTextProperty({
            name: 'Add Button Text',
            key: 'props.addText',
        }),
    ],
};

const cardWrapperConfig: FieldWrapperOption = {
    name: 'card',
    properties: [
        createTextProperty({
            name: 'Card Title',
            key: 'props.cardTitle',
        }),
    ],
};

export const formFieldWrapperConfig: FieldWrapperOption = {
    name: 'form-field',
    properties: [
        createTextProperty({
            name: 'Label',
            key: 'props.label',
        }),
        createTextProperty({
            name: 'Placeholder',
            key: 'props.placeholder',
        }),
        createTextProperty({
            name: 'Description',
            key: 'props.description',
        }),
        createBooleanProperty({
            name: 'Required',
            key: 'props.required',
        }),
    ],
};

export const validatorOptions: ValidatorOption[] = [
    {
        name: 'Ip',
        key: 'ip',
    },
];
export const asyncValidatorOptions: ValidatorOption[] = [
    {
        name: 'Ip Async',
        key: 'ipAsync',
    },
];

export const materialEditorConfig: EditorConfig = {
    id: 'editor-material',
    fieldOptions: [
        {
            displayName: 'Input',
            children: [inputTypeConfig, numberTypeConfig],
        },
        checkboxTypeConfig,
        radioTypeConfig,
        selectTypeConfig,
        textareaTypeConfig,
        groupTypeConfig,
        repeatTypeConfig,
    ],
    wrapperOptions: [cardWrapperConfig, formFieldWrapperConfig],
    validatorOptions,
    asyncValidatorOptions,
    defaultForm,
};
