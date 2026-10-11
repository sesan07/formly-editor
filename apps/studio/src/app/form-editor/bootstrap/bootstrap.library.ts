import { createLibrary } from '@formly-editor/core';
import { bootstrapConfigOptions } from './bootstrap.config';
import { formTemplates } from './bootstrap.forms';
import { bootstrapFieldCategoryOptions } from './bootstrap.options';

export const bootstrapFormEditorConfig = createLibrary({
  id: 'form-bootstrap',
  fieldCategoryOptions: bootstrapFieldCategoryOptions,
  enableFormUploadSchema: true,
  formTemplates,
  label: 'Bootstrap',
  configOptions: bootstrapConfigOptions(),
});
