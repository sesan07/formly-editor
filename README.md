# Formly Editor

A configurable editor for ngx-formly forms.

Demo: https://formly-editor.sesan.dev

![Demo Screenshot](docs/img/screenshot.png 'Demo Screenshot')

## How to run

-   Clone this repo: `git clone https://github.com/sesan07/formly-editor.git`
-   Install dependencies: `npm i`
-   Start app: `npm start`

The editor is also published as an [NPM library](https://www.npmjs.com/package/@sesan07/ngx-formly-editor). It can be installed with `npm i @sesan07/ngx-formly-editor`

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

export const editorConfig: EditorConfig = {
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
};
```

These helper functions can be used to create properties

-   `createArrayProperty({...})`
-   `createBooleanProperty({...})`
-   `createObjectProperty({...})`
-   `createTextProperty({...})`

### Import the EditorModule

```typescript
import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { EditorModule } from '@sesan07/ngx-formly-editor';
import { editorConfig } from './editor.config';

@NgModule({
    ...
    imports: [
        ...
        FormlyMaterialModule, // Can be replaced with other formly UI modules
        FormlyModule.forRoot({ // Configure formly
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        EditorModule.forRoot(editorConfig), // Configure the editor
    ],
})
export class MyModule {}
```

### Use the Editor Component

```typescript
import { Component } from '@angular/core';
import { IDefaultForm, IStylesConfig, tailwindConfig } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-example',
    template: `
        <!-- All inputs are optional -->
        <editor-main
            [autosaveStorageKey]="'editor-local-storage-key'"
            [autosaveDelay]="2000"
            [defaultForm]="defaultForm"
            [stylesConfig]="tailwindConfig"
        >
        </editor-main>
    `,
})
export class ExampleComponent {
    // Configuration for the editor's styling system (styling tab on UI) (defaults to tailwindConfig)
    // A `bootstrapConfig` is also available, or you can create yours.
    tailwindConfig: IStylesConfig = tailwindConfig;
    defaultForm: IDefaultForm = {
        name: 'Form Zero',
        fields: [...], // Formly field configs
        model: {...}
    }
}
```

### Import the editor's styles into your app

```scss
// Styles required by the editor
@import '@sesan07/ngx-formly-editor/styles';

// Generated tailwind styles for the editor's styling system if using tailwindConfig
@import '@sesan07/ngx-formly-editor/tailwind';
```

Questions or improvement suggestions are welcome!
