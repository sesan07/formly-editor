import { createLibrary } from '@formly-editor/core';
import {
  studioMaterialBuilderConfigOptions,
  studioMaterialConfigOptions,
} from './studio-material.config';
import { formTemplates } from './studio-material.forms';
import { studioMaterialFieldCategoryOptions } from './studio-material.options';

export const studioMaterialFormEditorConfig = createLibrary({
  id: 'form-studio-material',
  fieldCategoryOptions: studioMaterialFieldCategoryOptions,
  enableFormUploadSchema: true,
  formTemplates,
  label: 'Studio Material',
  configOptions: studioMaterialConfigOptions(),
  builderConfigOptions: studioMaterialBuilderConfigOptions(),
});
