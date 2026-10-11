import { createLibrary } from '@formly-editor/core';
import { materialConfigOptions } from './material.config';
import { formTemplates } from './material.forms';
import { materialFieldCategoryOptions } from './material.options';

export const materialFormEditorConfig = createLibrary({
  id: 'form-material',
  fieldCategoryOptions: materialFieldCategoryOptions,
  enableFormUploadSchema: true,
  formTemplates,
  label: 'Material',
  configOptions: materialConfigOptions(),
});
