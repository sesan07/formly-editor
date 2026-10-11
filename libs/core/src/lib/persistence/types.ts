import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DefaultForm, BaseEditorForm, WorkspaceHierarchy } from '../model/types';

/**
 * Form store interface describing persistence operations.
 */
export interface FormStoreService {
  /** Add a new form to storage. */
  addForm$(editorType: string, form: DefaultForm): Observable<void>;
  /** Update an existing form in storage. */
  updateForm$(editorType: string, form: DefaultForm): Observable<void>;
  /** Remove a form by id. */
  removeForm$(editorType: string, formId: string): Observable<void>;
  /** Retrieve a stored form by id. */
  getForm$(editorType: string, formId: string): Observable<DefaultForm>;
  /** List available forms for an editor. */
  getFormList$(editorType: string): Observable<BaseEditorForm[]>;
  /** Retrieve the full workspace hierarchy structure. */
  getHierarchy$(editorType: string): Observable<WorkspaceHierarchy>;
  /** Save the full workspace hierarchy structure. */
  saveHierarchy$(editorType: string, hierarchy: WorkspaceHierarchy): Observable<void>;
}
export const CORE_FORM_STORE = new InjectionToken<FormStoreService>('FormStoreService');
