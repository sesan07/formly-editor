# Formly Editor

A configurable editor for ngx-formly forms.

Demo: https://formly-editor.sesan.dev

Sample implementation with npm library: https://github.com/sesan07/formly-editor-app

## How to run

-   Clone repo: `git clone https://github.com/sesan07/formly-editor.git`
-   Install dependencies: `npm i`
-   Start app: `npm start`

## How to configure a field type

-   Add a config entry for the field type in the app module.
-   Configure a service that the editor can call to get data for the field type.
-   In the service, set the default FormlyFieldConfig and the properties to show on the UI for that field type.
