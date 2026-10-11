/*
 * Public API Surface of core
 */

export * from './lib/properties';

export { Core } from './lib/core';

export {
  CORE_LIBRARY_CONFIGS,
  type CoreEditorConfig,
  type FieldCategoryOption,
  type FieldTypeOption,
  type FieldTypePreset,
  type FieldWrapperOption,
  type LibraryConfig,
} from './lib/config/types';
export { type CoreAddFieldOption } from './lib/editor/types';
export {
  type BaseEditorForm,
  type BaseWorkspaceNode,
  type DefaultForm,
  type EditorForm,
  type FieldInfo,
  type FieldInfoBadge,
  type WorkspaceFolderNode,
  type WorkspaceFormNode,
  type WorkspaceHierarchy,
  type WorkspaceNode,
  type WorkspaceNodeType,
} from './lib/model/types';
export { CORE_FORM_STORE, type FormStoreService } from './lib/persistence/types';
export { CORE_THEME } from './lib/theme';

export { generateTypeOptionSchema, generateTypeOptionSchemaMap } from './lib/config/schema';
export {
  addNodeToHierarchy,
  buildHierarchyFromFlatForms,
  createEmptyWorkspaceHierarchy,
  getDescendantNodeIds,
  isAncestorOf,
  moveNodeInHierarchy,
  recalculateNodePaths,
  removeNodeFromHierarchy,
  renameNodeInHierarchy,
  toggleFolderExpansion,
} from './lib/model/workspace-hierarchy.utils';

export { CoreFieldService } from './lib/config/core-field.service';
export { CoreLibraryService } from './lib/config/core-library.service';
export { BuilderFieldStateService } from './lib/editor/builder-field-state.service';
export { CoreFormService } from './lib/editor/core-form.service';
export { CreateFormDialogService } from './lib/panel/forms-panel/create-form-dialog.service';
export { ImportDialogService } from './lib/panel/forms-panel/import-dialog.service';
export { MarkdownDialogService } from './lib/properties/markdown/markdown-dialog.service';

export {
  provideCore,
  provideCoreConfig,
  provideCoreTheme,
  provideFormStore,
  provideLocalFormStore,
} from './lib/provider';

export { primengPreset } from './lib/primeng';

export { createLibrary } from './lib/config/library';
