import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IEditorFormlyField } from '../editor.types';
import { IEditorState } from './state.types';
import { getFieldMap } from './state.utils';

export const selectEditor = createFeatureSelector<Readonly<IEditorState>>('editor');
export const selectFormMap = createSelector(selectEditor, editor => editor.formMap);
export const selectForms = createSelector(selectFormMap, formMap => Object.values(formMap));
export const selectActiveFormId = createSelector(selectEditor, editor => editor.activeFormId);
export const selectActiveForm = createSelector(selectFormMap, selectActiveFormId, (formMap, formId) => formMap[formId]);
export const selectActiveFormIndex = createSelector(selectFormMap, selectActiveFormId, (formMap, formId) =>
    Object.keys(formMap).indexOf(formId)
);
export const selectActiveFieldMap = createSelector(selectActiveForm, form =>
    form?.fields?.reduce<Record<string, IEditorFormlyField>>((a, f) => ({ ...a, ...getFieldMap(f) }), {})
);
export const selectActiveField = createSelector(
    selectActiveForm,
    selectActiveFieldMap,
    (form, fieldMap) => fieldMap?.[form?.activeFieldId] ?? null
);
export const selectActiveModel = createSelector(selectActiveForm, form => form?.model);
