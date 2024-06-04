import { createAction, props } from '@ngrx/store';
import { FormlyFieldConfig } from '@ngx-formly/core';

import { FieldTypeOption, GetDefaultField, IEditorFormlyField } from '../editor.types';
import { IPropertyChange } from '../property/property.types';

export interface EditorAction {
    editorId: string;
}

export interface AddForm extends EditorAction {
    name: string;
    sourceFields?: FormlyFieldConfig[];
    model?: object;
    typeOptions: FieldTypeOption[];
    defaultTypeOption: FieldTypeOption;
    getDefaultField: GetDefaultField;
}
export interface RemoveForm extends EditorAction {
    formId: string;
}
export interface DuplicateForm extends EditorAction {
    formId: string;
}
export interface SetActiveFormId extends EditorAction {
    activeFormId: string;
}
export interface AddField extends EditorAction {
    fieldType: string;
    parent?: IEditorFormlyField;
    index?: number;
    typeOptions: FieldTypeOption[];
    defaultTypeOption: FieldTypeOption;
    getDefaultField: GetDefaultField;
}
export interface RemoveField extends EditorAction {
    fieldId: string;
    parent?: IEditorFormlyField;
    keyPath?: string;
}
export interface SetEditMode extends EditorAction {
    formId: string;
    isEditMode: boolean;
}
export interface ModifyActiveField extends EditorAction {
    activeField: IEditorFormlyField;
    change: IPropertyChange;
}
export interface SetActiveField extends EditorAction {
    activeFieldId: string;
}
export interface ModifyActiveModel extends EditorAction {
    change: IPropertyChange;
}
export interface SetActiveModel extends EditorAction {
    model: Record<string, unknown>;
}
export interface ReplaceField extends EditorAction {
    field: IEditorFormlyField;
    parent?: IEditorFormlyField;
    newFieldType: string;
    typeOptions: FieldTypeOption[];
    defaultTypeOption: FieldTypeOption;
    keyPath?: string;
    getDefaultField: GetDefaultField;
}
export interface MoveField extends EditorAction {
    sourceField: IEditorFormlyField;
    sourceParent: IEditorFormlyField;
    targetParent?: IEditorFormlyField;
    sourceIndex: number;
    targetIndex?: number;
}

export const addForm = createAction('[Editor] Add Form', props<AddForm>());
export const removeForm = createAction('[Editor] Remove Form', props<RemoveForm>());
export const duplicateForm = createAction('[Editor] Duplicate Form', props<DuplicateForm>());
export const setActiveFormId = createAction('[Editor] Set Active Form ID', props<SetActiveFormId>());
export const setEditMode = createAction('[Editor] Set Edit Mode', props<SetEditMode>());

export const addField = createAction('[Editor] Add Field', props<AddField>());
export const removeField = createAction('[Editor] Remove Field', props<RemoveField>());
export const modifyActiveField = createAction('[Editor] Modify Active Field', props<ModifyActiveField>());
export const setActiveField = createAction('[Editor] Set Active Field', props<SetActiveField>());
export const replaceField = createAction('[Editor] Replace Field', props<ReplaceField>());
export const moveField = createAction('[Editor] Move Field', props<MoveField>());

export const modifyActiveModel = createAction('[Editor] Modify Active Model', props<ModifyActiveModel>());
export const setActiveModel = createAction('[Editor] Set Active Model', props<SetActiveModel>());
