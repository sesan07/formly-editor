import { FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';

/**
 * Metadata about a field used by the editor to track relationships and UI state.
 */
export interface FieldInfo {
  childIds: string[];
  isFieldArray?: boolean;
  /** Field name/label used for display or key generation. */
  name: string;
  /** The id of the form this field belongs to. */
  formId: string;
  /** Unique id for the field. */
  id: string;
  /** Array of ancestor ids followed by this field's id. */
  idPath: string[];
  /** True when the field can contain children. */
  isParent?: boolean;
  /** True when the field is a root-level field. */
  isRoot?: boolean;
  /** Optional UI badges to display alongside the field. */
  badges?: FieldInfoBadge[];
}

/**
 * Small descriptive badge attached to a field in the UI.
 */
export interface FieldInfoBadge {
  /** Short badge text. */
  label: string;
  /** Longer description shown in a tooltip. */
  description: string;
}

export type EditorField<
  Props = FormlyFieldProps & {
    [additionalProperties: string]: unknown;
  },
> = FormlyFieldConfig<Props> & {
  _info: FieldInfo;
  fieldGroup?: EditorField[];
  fieldArray?: EditorField;
  [key: string]: unknown;
};

/**
 * Basic metadata for an editor form.
 */
export interface BaseEditorForm {
  /** Unique form id. */
  id: string;
  libraryId: string;
  fieldCount: number;
  /** Human friendly form name. */
  name: string;
  /** Optional parent directory/folder id. */
  parentId?: string | null;
}

/**
 * Full form representation including fields and model.
 */
export interface EditorForm extends BaseEditorForm {
  /** Map of field id -> field instance. */
  fieldMap: Record<string, EditorField>;
  /** Ordered ids for root-level fields. */
  rootFieldIds: string[];
  /** Form model data object. */
  model: Record<string, unknown>;
}

/**
 * Default form package used when creating a new form from a template.
 */
export interface DefaultForm {
  /** Identifier for the form. Will be generated if not set */
  id?: string;
  libraryId: string;
  fieldCount?: number;
  /** Optional parent folder id */
  parentId?: string | null;
  /** Form name. */
  name: string;
  /** Optional icon identifier (e.g. Material Symbols name) shown on template cards. */
  icon?: string;
  /** Optional short description shown on template cards. */
  description?: string;
  /** Array of field definitions for the template. */
  fields: FormlyFieldConfig[];
  /** Initial model for the template form. */
  model: Record<string, unknown>;
}

/**
 * Node types for workspace folder and form hierarchy.
 */
export type WorkspaceNodeType = 'folder' | 'form';

export interface BaseWorkspaceNode {
  id: string;
  name: string;
  type: WorkspaceNodeType;
  parentId: string | null;
  idPath: string[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceFolderNode extends BaseWorkspaceNode {
  type: 'folder';
  childIds: string[];
  isExpanded?: boolean;
}

export interface WorkspaceFormNode extends BaseWorkspaceNode {
  type: 'form';
  libraryId: string;
  fieldCount?: number;
}

export type WorkspaceNode = WorkspaceFolderNode | WorkspaceFormNode;

export interface WorkspaceHierarchy {
  workspaceId: string;
  rootNodeIds: string[];
  nodeMap: Record<string, WorkspaceNode>;
}
