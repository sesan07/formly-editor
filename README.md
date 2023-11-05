# Formly Editor

A configurable editor for ngx-formly forms.

Demo: https://formly-editor.sesan.dev

## How to run

-   Clone this repo: `git clone https://github.com/sesan07/formly-editor.git`
-   Install dependencies: `npm i`
-   Start app: `npm start`

The editor is also published as an [NPM library](https://www.npmjs.com/package/@sesan07/ngx-formly-editor). If you don't need to make changes to the editor's core code, you can just install and use the npm package.

## Configuration

### Editor Component

The editor's component can be added your app like this (all inputs are optional):

```typescript
import { IDefaultForm, tailwindConfig } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-example',
    template: `
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
    tailwindConfig = tailwindConfig;
    defaultForm: IDefaultForm = {
        ...
    }
}
```

Default form interface

```typescript
export interface IDefaultForm {
    name: string;
    fields: FormlyFieldConfig[];
    model: object;
}
```

### Editor Module

The `EditorModule` can be imported and configured in the app's root module using `EditorModule.forRoot({...})`

The configuration interface

```typescript
export interface EditorConfig {
    // Configuration for field types. Unconfigured field types will be treated as generic
    options: FieldOption[];
}
```

Field options can be grouped into categories

```typescript
export type FieldOption = FieldCategoryOption | FieldTypeOption;

export interface FieldCategoryOption {
    // The display name for a category
    displayName: string;
    // Field type options under a category
    children: FieldTypeOption[];
}

export interface FieldTypeOption {
    // The formly field type
    type: string;
    // The display name for the field type on the UI
    displayName: string;
    // Add a prefix to keys generated for this type
    keyGenerationPrefix?: string;
    // Disable key generation when adding instances of this field type
    disableKeyGeneration?: boolean;
    // Configuration for this field's children, if it's a container
    childrenConfig?: FieldTypeChildrenConfig;
    // A service that the editor can call to get data for this field type
    // BaseFieldService is exported by the editor, and can be extended for each or all field types
    service: Type<BaseFieldService<FormlyFieldProps>>;
}

export interface FieldTypeChildrenConfig {
    // Dot separated for children, e.g `fieldGroup` or `fieldArray.fieldGroup`
    path: string;
    // Whether child is a single object or a list of children
    isObject?: boolean;
}
```

Here's a sample configuration

```typescript
import { StoreModule } from '@ngrx/store';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { EditorModule, tailwindConfig } from '@sesan07/ngx-formly-editor';
import { FormlyGroupService } from './services/field-services/formly-group/formly-group.service';
import { InputService } from './services/field-services/input/input.service';

@NgModule({
    ...
    imports: [
        ...
        // Can be replaced with other formly UI modules
        FormlyMaterialModule,
        // Configure formly
        FormlyModule.forRoot({
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        // Configure editor
        EditorModule.forRoot({
            options: [
                {
                    displayName: 'Input',
                    children: [
                        {
                            displayName: 'Input',
                            type: 'input',
                            keyGenerationPrefix: 'inp',
                            service: InputService,
                        },
                        {
                            displayName: 'Number',
                            type: 'number',
                            keyGenerationPrefix: 'num',
                            service: InputService,
                        },
                    ],
                },
                {
                    displayName: 'Group',
                    type: 'formly-group',
                    disableKeyGeneration: true,
                    childrenConfig: {
                        path: 'fieldGroup',
                    },
                    service: FormlyGroupService,
                },
                ...
            ],
        }),
        // The editor uses NGRX to manage state
        StoreModule.forRoot({}),
    ],
    ...
})
export class AppModule {}

```

### Field type service

The editor uses configured field services to get data for each field type. Here's an example

```typescript
import { Injectable } from '@angular/core';
import { BaseFieldService, IProperty, PropertyType } from '@sesan07/ngx-formly-editor';

import { IInputProps } from './input.types';

@Injectable({
    providedIn: 'root',
})
export class InputService extends BaseFieldService<IInputProps> {
    // Returns a default configuration based on the field type
    public getDefaultField(type: string) {
        const config = {
            type,
            wrappers: ['form-field'],
            props: {
                label: 'Label',
                placeholder: 'Placeholder',
                description: 'Description',
                required: true,
            },
        };

        if (type === 'number' || type === 'integer') {
            config.props.type = 'number';
        }

        return config;
    }

    // Returns the configuration options to show on the UI for this field type
    protected _getFieldProperties(): IProperty[] {
        return [
            {
                // Name of this option
                name: 'Type',
                // Dot separated path in the field
                key: 'props.type',
                // The type of input field to display on the UI
                type: PropertyType.TEXT,
            },
            ...
            {
                name: 'Required',
                key: 'props.required',
                type: PropertyType.BOOLEAN,
            },
            ...
        ];
    }

    // Returns the supported wrappers for this field type
    protected _getWrapperTypes(): string[] {
        return ['form-field'];
    }

    // Returns the configuration options to show on the UI for supported wrappers
    protected _getWrapperProperties(): IProperty[] {
        return [];
    }
}
```

More examples are available in the demo app.

Questions or improvement suggestions are welcome!
