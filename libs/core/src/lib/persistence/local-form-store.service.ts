import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseEditorForm, DefaultForm, WorkspaceFormNode, WorkspaceHierarchy } from '../model/types';
import { FormStoreService } from './types';
import {
  addNodeToHierarchy,
  buildHierarchyFromFlatForms,
  removeNodeFromHierarchy,
  renameNodeInHierarchy,
} from '../model/workspace-hierarchy.utils';

@Injectable()
export class LocalFormStoreService implements FormStoreService {
  readonly storageKey = 'formly-studio-forms';
  readonly hierarchyStorageKey = 'formly-studio-hierarchy';

  addForm$(editorType: string, newForm: DefaultForm) {
    const formMap = this.getFormMap(editorType);
    formMap[newForm.id!] = newForm;
    this.storeFormMap(editorType, formMap);

    let hierarchy = this.getHierarchySync(editorType);
    const parentId = newForm.parentId ?? null;
    const formNode: WorkspaceFormNode = {
      id: newForm.id!,
      name: newForm.name,
      type: 'form',
      libraryId: newForm.libraryId,
      fieldCount: newForm.fieldCount ?? newForm.fields.length,
      parentId,
      idPath:
        parentId && hierarchy.nodeMap[parentId]
          ? [...hierarchy.nodeMap[parentId].idPath, newForm.id!]
          : [newForm.id!],
    };
    hierarchy = addNodeToHierarchy(hierarchy, formNode);
    this.storeHierarchy(editorType, hierarchy);

    return of(void 0);
  }

  updateForm$(editorType: string, newForm: DefaultForm) {
    const formMap = this.getFormMap(editorType);
    formMap[newForm.id!] = newForm;
    this.storeFormMap(editorType, formMap);

    let hierarchy = this.getHierarchySync(editorType);
    if (hierarchy.nodeMap[newForm.id!]) {
      hierarchy = renameNodeInHierarchy(hierarchy, newForm.id!, newForm.name);
      const node = hierarchy.nodeMap[newForm.id!];
      if (node && node.type === 'form') {
        node.fieldCount = newForm.fieldCount ?? newForm.fields.length;
        node.libraryId = newForm.libraryId;
      }
      this.storeHierarchy(editorType, hierarchy);
    }
    return of(void 0);
  }

  removeForm$(editorType: string, formId: string) {
    const formMap = this.getFormMap(editorType);
    delete formMap[formId];
    this.storeFormMap(editorType, formMap);

    const hierarchy = this.getHierarchySync(editorType);
    if (hierarchy.nodeMap[formId]) {
      const res = removeNodeFromHierarchy(hierarchy, formId);
      this.storeHierarchy(editorType, res.hierarchy);
    }
    return of(void 0);
  }

  getFormList$(editorType: string): Observable<BaseEditorForm[]> {
    return of(
      Object.values(this.getFormMap(editorType)).map((f) => ({
        id: f.id!,
        libraryId: f.libraryId,
        fieldCount: f.fieldCount ?? f.fields.length,
        name: f.name,
        parentId: f.parentId,
      })),
    );
  }

  getForm$(editorType: string, formId: string): Observable<DefaultForm> {
    return of(this.getFormMap(editorType)[formId]);
  }

  getHierarchy$(editorType: string): Observable<WorkspaceHierarchy> {
    return of(this.getHierarchySync(editorType));
  }

  saveHierarchy$(editorType: string, hierarchy: WorkspaceHierarchy): Observable<void> {
    this.storeHierarchy(editorType, hierarchy);
    return of(void 0);
  }

  protected getHierarchySync(editorType: string): WorkspaceHierarchy {
    const hierarchyStorageKey = `${this.hierarchyStorageKey}-${editorType}`;
    const raw = localStorage.getItem(hierarchyStorageKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing hierarchy from local storage', e);
      }
    }
    // Fallback: build from existing forms map
    const forms = Object.values(this.getFormMap(editorType)).map((f) => ({
      id: f.id!,
      libraryId: f.libraryId,
      fieldCount: f.fieldCount ?? f.fields.length,
      name: f.name,
      parentId: f.parentId,
    }));
    const hierarchy = buildHierarchyFromFlatForms(editorType, forms);
    this.storeHierarchy(editorType, hierarchy);
    return hierarchy;
  }

  protected storeHierarchy(editorType: string, hierarchy: WorkspaceHierarchy) {
    const hierarchyStorageKey = `${this.hierarchyStorageKey}-${editorType}`;
    localStorage.setItem(hierarchyStorageKey, JSON.stringify(hierarchy));
  }

  protected getFormMap(editorType: string): Record<string, DefaultForm> {
    const editorStorageKey = `${this.storageKey}-${editorType}`;
    return JSON.parse(localStorage.getItem(editorStorageKey) || '{}');
  }

  protected storeFormMap(editorType: string, formMap: Record<string, DefaultForm>) {
    const editorStorageKey = `${this.storageKey}-${editorType}`;
    localStorage.setItem(editorStorageKey, JSON.stringify(formMap));
  }
}
