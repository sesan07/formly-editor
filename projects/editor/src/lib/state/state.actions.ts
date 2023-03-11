import { createAction, props } from '@ngrx/store';
import { EditorTypeOption, GetDefaultField, IBaseFormlyField, IEditorFormlyField } from '../editor.types';
import { IPropertyChange } from '../property/property.types';

export interface AddForm {
    name: string;
    sourceFields?: IBaseFormlyField[];
    model?: Record<string, unknown>;
    typeOptions: EditorTypeOption[];
    unknownTypeName?: string;
    getDefaultField: GetDefaultField;
}
export interface RemoveForm {
    formId: string;
}
export interface DuplicateForm {
    formId: string;
}
export interface SetActiveFormId {
    activeFormId: string;
}
export interface AddField {
    fieldType: string;
    customType?: string;
    parent?: IEditorFormlyField;
    index?: number;
    typeOptions: EditorTypeOption[];
    unknownTypeName?: string;
    getDefaultField: GetDefaultField;
}
export interface RemoveField {
    fieldId: string;
    parent?: IEditorFormlyField;
}
export interface SetEditMode {
    formId: string;
    isEditMode: boolean;
}
export interface ModifyActiveField {
    activeField: IEditorFormlyField;
    change: IPropertyChange;
}
export interface SetActiveField {
    activeFieldId: string;
}
export interface ModifyActiveModel {
    change: IPropertyChange;
}
export interface SetActiveModel {
    model: Record<string, unknown>;
}
export interface ReplaceField {
    field: IEditorFormlyField;
    parent?: IEditorFormlyField;
    fieldType: string;
    customType?: string;
    typeOptions: EditorTypeOption[];
    unknownTypeName?: string;
    getDefaultField: GetDefaultField;
}
export interface MoveField {
    parent?: IEditorFormlyField;
    from: number;
    to?: number;
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
