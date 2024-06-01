import { Component } from '@angular/core';
import { IDefaultForm, IStylesConfig, bootstrapConfig } from '@sesan07/ngx-formly-editor';
import { EditorModule } from '../../../projects/editor/src/lib/editor.module';

@Component({
    selector: 'app-bootstrap',
    template: `
        <editor-main
            autosaveStorageKey="editor-bootstrap"
            [defaultForm]="defaultForm"
            [stylesConfig]="bootstrapConfig"
        >
        </editor-main>
    `,
    standalone: true,
    imports: [EditorModule],
})
export class BootstrapComponent {
    bootstrapConfig: IStylesConfig = bootstrapConfig;

    defaultForm: IDefaultForm = {
        name: 'Bootstrap Form Zero',
        fields: [
            {
                type: 'formly-group',
                fieldGroup: [
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
                                        className: 'col-6',
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
                                        className: 'col-6',
                                    },
                                ],
                                fieldGroupClassName: 'row gx-2',
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
                            },
                        ],
                        key: 'group2',
                    },
                    {
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
                                className: 'col-6',
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
                                className: 'col-6',
                            },
                        ],
                        fieldGroupClassName: 'row gx-2',
                    },
                ],
                key: 'group',
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
                className: 'mt-2',
            },
        ],
        model: {
            group: {
                group2: {
                    input: 'Hello!',
                    num: 321,
                    textarea: 'Bye!',
                },
                radio: 1,
                select: [2, 3],
            },
            checkbox: true,
        },
    };
}
