/*
 * Public API Surface of editor
 */

export * from './lib/property/boolean-property/boolean-property.types';
export * from './lib/property/input-property/input-property.types';
export * from './lib/property/object-array-properties/array-property.types';
export * from './lib/property/object-array-properties/object-property.types';
export * from './lib/property/select-property/select-property.types';
export { IBaseProperty, IProperty } from './lib/property/property.types';

export { bootstrapConfig } from './lib/edit-field/styles/styles-config/bootstrap.styles-config';
export { tailwindConfig } from './lib/edit-field/styles/styles-config/tailwind.styles-config';
export * from './lib/edit-field/styles/styles.types';

export { FormlyGroupComponent } from './lib/custom-formly/formly-group/formly-group.component';
export { EditorComponent } from './lib/editor.component';
export { EditorModule } from './lib/editor.module';
export {
    EditorConfig,
    FieldCategoryOption,
    FieldTypeChildrenConfig,
    FieldTypeOption,
    FieldWrapperOption,
    IDefaultForm,
    IEditorFormlyField,
} from './lib/editor.types';
