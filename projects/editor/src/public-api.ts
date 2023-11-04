/*
 * Public API Surface of editor
 */

export { IBaseProperty, IProperty, PropertyType } from './lib/property/property.types';
export { IArrayProperty } from './lib/property/object-array-properties/array-property.types';
export { IBooleanProperty } from './lib/property/boolean-property/boolean-property.types';
export { IInputProperty } from './lib/property/input-property/input-property.types';
export { ITextareaProperty } from './lib/property/textarea-property/textarea-property.types';
export { IObjectProperty } from './lib/property/object-array-properties/object-property.types';

export * from './lib/edit-field/styles/styles.types';
export { tailwindConfig } from './lib/edit-field/styles/styles-config/tailwind.styles-config';
export { bootstrapConfig } from './lib/edit-field/styles/styles-config/bootstrap.styles-config';

export { EditorComponent } from './lib/editor.component';
export { FormlyGroupComponent } from './lib/custom-formly/formly-group/formly-group.component';
export { BaseFieldService } from './lib/field-service/base-field.service';
export { EditorModule } from './lib/editor.module';
export { IEditorFormlyField } from './lib/editor.types';
