# Formly Editor

A configurable editor for ngx-formly forms.

This project uses standalone components.

Demo: https://formly-editor.sesan.dev

![Demo Screenshot](docs/img/screenshot.png 'Demo Screenshot')

## How to run

-   Clone this repo: `git clone https://github.com/sesan07/formly-editor.git`
-   Install dependencies: `npm i`
-   Start app: `npm start`

## Setup

### Create a config

```typescript
import { EditorConfig, createTextProperty } from '@sesan07/ngx-formly-editor';

// Configure input type
const inputTypeConfig: FieldTypeOption = {
    displayName: 'Input', // Name displayed on the UI
    name: 'input', // Name (type) configured in formly
    keyGenerationPrefix: 'inp', // Used to generate keys for this field type (optional)
    defaultConfig: { // Default formly config when creating a field of this type
        wrappers: ['form-field'],
        props: {
            label: 'Label',
            placeholder: 'Placeholder',
            description: 'Description',
            required: true,
        },
    },
    properties: [ // The configurable properties to display on the UI for this field type (optional)
        createTextProperty({
            name: 'Type',
            key: 'props.type',
        }),
        ...
    ],
};

// Configure card wrapper (custom wrapper)
const cardWrapperConfig: FieldWrapperOption = {
    name: 'card',
    properties: [ // The configurable properties to display when a field has this wrapper (optional)
        createTextProperty({
            name: 'Card Title',
            key: 'props.cardTitle',
        }),
        ...
    ],
};

// Configure validator options that can be set
export const validatorOptions: ValidatorOption[] = [
    {
        name: 'Ip',
        key: 'ip',
    }
    ...
];

export const editorConfig: EditorConfig = {
    id: 'editor',
    fieldOptions: [ // Configs for fields or field categories
        { // A field category
            displayName: 'Input',
            children: [inputTypeConfig, anotherConfig],
        },
        yetAnotherConfig,
        anotherCategory,
        ...
    ],
    wrapperOptions: [cardWrapperConfig], // configs for wrappers
    validatorOptions: validatorOptions,
    defaultForm: {
        name: 'Form Zero',
        fields: [...], // Formly field configs
        model: {...}
    },
};
```

These helper functions can be used to create properties

-   `createArrayProperty({...})`
-   `createBooleanProperty({...})`
-   `createObjectProperty({...})`
-   `createSelectProperty({...})`
-   `createTextProperty({...})`

### Provide the Editor config

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';

import { provideEditor, provideEditorConfig, withConfig } from '@sesan07/ngx-formly-editor';

import { editorConfig1, editorConfig2 } from './editor.config';

// Single route setup
export const appConfig: ApplicationConfig = {
    providers: [
        ...
        // Provide the editor and config
        provideEditor(withConfig(editorConfig1)),
        // Ngx-formly configuration
        importProvidersFrom([
            FormlyModule.forRoot({ ... }),
        ]),
        ...
    ],
};

// Multi route setup
export const appConfig: ApplicationConfig = {
    providers: [
        ...
        // Provide the editor
        provideEditor(),
        provideRouter([
            {
                path: 'path1',
                // Provide editorConfig1 for path1
                providers: [provideEditorConfig(editorConfig1)],
            },
            {
                path: 'path2',
                // Provide editorConfig2 for path2
                providers: [provideEditorConfig(editorConfig2)],
            },
        ])
        // Ngx-formly configuration
        importProvidersFrom([
            FormlyModule.forRoot({ ... }),
        ]),
        ...
    ],
};
```

`EditorModule.forRoot(config?)` and `EditorModule.forChild(config)` are also available for non standalone apps.

### Use the Editor Component

```typescript
import { Component } from '@angular/core';
import { EditorComponent } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-example',
    template: ` <editor-main></editor-main> `,
    standalone: true,
    imports: [EditorComponent],
})
export class ExampleComponent {}
```

### Import the editor's styles into your app

```scss
// Styles required by the editor
@import '@sesan07/ngx-formly-editor/styles';

// Generated tailwind styles for the editor's styling system if using tailwindConfig
@import '@sesan07/ngx-formly-editor/tailwind';
```

Questions or improvement suggestions are welcome!
