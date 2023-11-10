import {
    EditorConfig,
    FieldTypeOption,
    FieldWrapperOption,
    IArrayProperty,
    IObjectProperty,
    PropertyType,
} from '@sesan07/ngx-formly-editor';

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
        {
            name: 'Type',
            key: 'props.type',
            type: PropertyType.TEXT,
        },
        {
            name: 'Label',
            key: 'props.label',
            type: PropertyType.TEXT,
        },
        {
            name: 'Placeholder',
            key: 'props.placeholder',
            type: PropertyType.TEXT,
        },
        {
            name: 'Description',
            key: 'props.description',
            type: PropertyType.TEXT,
        },
        {
            name: 'Required',
            key: 'props.required',
            type: PropertyType.BOOLEAN,
        },
    ],
};

export const numberTypeConfig: FieldTypeOption = {
    ...inputTypeConfig,
    defaultConfig: {
        type: 'number',
        ...inputTypeConfig.defaultConfig,
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
        {
            name: 'Label',
            key: 'props.label',
            type: PropertyType.TEXT,
        },
        {
            name: 'Description',
            key: 'props.description',
            type: PropertyType.TEXT,
        },
        {
            name: 'Required',
            key: 'props.required',
            type: PropertyType.BOOLEAN,
        },
        {
            name: 'Pattern',
            key: 'props.pattern',
            type: PropertyType.TEXT,
        },
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
        {
            name: 'Label',
            key: 'props.label',
            type: PropertyType.TEXT,
        },
        {
            name: 'Placeholder',
            key: 'props.placeholder',
            type: PropertyType.TEXT,
        },
        {
            name: 'Description',
            key: 'props.description',
            type: PropertyType.TEXT,
        },
        {
            name: 'Required',
            key: 'props.required',
            type: PropertyType.BOOLEAN,
        },
        {
            name: 'Options',
            key: 'props.options',
            type: PropertyType.ARRAY,
            canAdd: true,
            childProperty: {
                type: PropertyType.OBJECT,
                isRemovable: true,
                childProperties: [
                    {
                        name: 'Label',
                        key: 'label',
                        type: PropertyType.TEXT,
                    },
                    {
                        name: 'Value',
                        key: 'value',
                        type: PropertyType.TEXT,
                        outputRawValue: true,
                    },
                    {
                        name: 'Disabled',
                        key: 'disabled',
                        type: PropertyType.BOOLEAN,
                    },
                ],
            } as IObjectProperty,
        } as IArrayProperty,
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
        {
            name: 'Label',
            key: 'props.label',
            type: PropertyType.TEXT,
        },
        {
            name: 'Placeholder',
            key: 'props.placeholder',
            type: PropertyType.TEXT,
        },
        {
            name: 'Description',
            key: 'props.description',
            type: PropertyType.TEXT,
        },
        {
            name: 'Select all options label',
            key: 'props.selectAllOption',
            type: PropertyType.TEXT,
        },
        {
            name: 'Multiple selections',
            key: 'props.multiple',
            type: PropertyType.BOOLEAN,
        },
        {
            name: 'Required',
            key: 'props.required',
            type: PropertyType.BOOLEAN,
        },
        {
            name: 'Options',
            key: 'props.options',
            type: PropertyType.ARRAY,
            canAdd: true,
            childProperty: {
                type: PropertyType.OBJECT,
                isRemovable: true,
                childProperties: [
                    {
                        name: 'Label',
                        key: 'label',
                        type: PropertyType.TEXT,
                    },
                    {
                        name: 'Value',
                        key: 'value',
                        type: PropertyType.TEXT,
                        outputRawValue: true,
                    },
                    {
                        name: 'Disabled',
                        key: 'disabled',
                        type: PropertyType.BOOLEAN,
                    },
                ],
            } as IObjectProperty,
        } as IArrayProperty,
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
    properties: [
        {
            name: 'Label',
            key: 'props.label',
            type: PropertyType.TEXT,
        },
        {
            name: 'Placeholder',
            key: 'props.placeholder',
            type: PropertyType.TEXT,
        },
        {
            name: 'Description',
            key: 'props.description',
            type: PropertyType.TEXT,
        },
        {
            name: 'Required',
            key: 'props.required',
            type: PropertyType.BOOLEAN,
        },
    ],
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

export const repeatTypeConfig: FieldTypeOption = {
    displayName: 'Repeating Section',
    name: 'repeating-section',
    keyGenerationPrefix: 'rep',
    childrenConfig: {
        path: 'fieldArray',
        isObject: true,
    },
    defaultConfig: {
        templateOptions: {
            addText: 'Add Section',
        },
        fieldArray: {
            fieldGroup: [],
        },
    },
    properties: [
        {
            name: 'Add Text',
            key: 'props.addText',
            type: PropertyType.TEXT,
        },
    ],
};

const cardWrapperConfig: FieldWrapperOption = {
    name: 'card',
    properties: [
        {
            name: 'Card Title',
            key: 'props.cardTitle',
            type: PropertyType.TEXT,
        },
    ],
};

export const materialEditorConfig: EditorConfig = {
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
    wrapperOptions: [
        cardWrapperConfig,
        {
            name: 'form-field',
        },
    ],
};
