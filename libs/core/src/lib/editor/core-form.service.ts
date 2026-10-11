import { computed, inject, Injectable, signal } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { get, isEmpty, unset } from 'lodash-es';
import { create } from 'mutative';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  BaseEditorForm,
  DefaultForm,
  EditorField,
  EditorForm,
  FieldInfo,
  WorkspaceFolderNode,
  WorkspaceHierarchy,
} from '../model/types';
import { CORE_EDITOR_CONFIG, FieldTypePreset } from '../config/types';
import { CORE_FORM_STORE } from '../persistence/types';
import { CoreAddFieldOption } from './types';
import { modifyPropertyTarget } from '../properties';
import { PropertyChange } from '../properties/types';
import {
  clearFieldModelValue,
  convertField,
  generateFieldId,
  generateFormId,
} from '../formly/field-conversion';
import {
  addNodeToHierarchy,
  createEmptyWorkspaceHierarchy,
  moveNodeInHierarchy,
  removeNodeFromHierarchy,
  renameNodeInHierarchy,
  toggleFolderExpansion,
} from '../model/workspace-hierarchy.utils';
import { CoreFieldService } from '../config/core-field.service';
import { CoreLibraryService } from '../config/core-library.service';
import { PanelService } from './panel.service';

@Injectable()
export class CoreFormService {
  protected readonly editorConfig = inject(CORE_EDITOR_CONFIG);
  protected libraryService = inject(CoreLibraryService);
  protected formStoreService = inject(CORE_FORM_STORE);
  protected fieldService = inject(CoreFieldService);
  protected panelService = inject(PanelService);
  private readonly autosaveTrigger$ = new Subject<string | null>();
  private readonly autosaveEnabled = this.editorConfig.autoSave === true;
  private readonly autosaveDelay =
    typeof this.editorConfig.autoSaveDelay === 'number' ? this.editorConfig.autoSaveDelay : 3000;

  readonly activeFormDisplayModeSrc = signal<'form' | 'preview' | 'json'>('form');
  readonly activeFormDisplayMode = this.activeFormDisplayModeSrc.asReadonly();
  readonly isEditMode = computed(() => this.activeFormDisplayModeSrc() === 'form');
  readonly saveActiveFormTrigger$ = new Subject<void>();
  readonly saveStatusSrc = signal<'saved' | 'dirty' | 'saving' | 'error'>('saved');
  readonly saveStatus = this.saveStatusSrc.asReadonly();

  protected readonly mouseInsideIds = signal<string[]>([]);
  readonly activeMouseInside = computed(() => {
    const ids = this.mouseInsideIds();
    return ids.length ? ids[ids.length - 1] : null;
  });

  protected readonly formListSrc = signal<BaseEditorForm[]>([]);
  protected readonly hierarchySrc = signal<WorkspaceHierarchy>(
    createEmptyWorkspaceHierarchy(this.editorConfig.editorType),
  );
  protected readonly activeFieldIdSrc = signal<string | null>(null);
  protected readonly activeFormSrc = signal<EditorForm | null>(null);
  protected readonly activeFieldIdByFormSrc = signal<Record<string, string | null>>({});

  readonly formList = this.formListSrc.asReadonly();
  readonly hierarchy = this.hierarchySrc.asReadonly();
  readonly hierarchyRootNodeIds = computed(() => this.hierarchy().rootNodeIds);
  readonly hierarchyNodeMap = computed(() => this.hierarchy().nodeMap);
  readonly activeFieldId = this.activeFieldIdSrc.asReadonly();
  readonly activeForm = this.activeFormSrc.asReadonly();

  readonly activeFormId = computed(() => this.activeForm()?.id);
  readonly activeFormName = computed(() => this.activeForm()?.name);
  readonly activeRootFieldIds = computed(() => this.activeForm()?.rootFieldIds ?? []);
  readonly activeFieldMap = computed(() => this.activeForm()?.fieldMap ?? {});
  readonly activeFieldCount = computed(() => Object.keys(this.activeFieldMap()).length);
  readonly activeField = computed(() => {
    const activeFieldId = this.activeFieldId();
    if (!activeFieldId) {
      return null;
    }
    return this.activeFieldMap()[activeFieldId] || null;
  });
  readonly activeFormFieldsRaw = computed(() =>
    this.activeRootFieldIds().map((id) => this.buildField(id, this.activeFieldMap())),
  );
  readonly activeModel = computed(() => this.activeForm()?.model || {});
  readonly activeSchema = computed(() => {
    return this.libraryService.activeLibrary()?.schema;
  });

  readonly activeFormFields = computed(() => structuredClone(this.activeFormFieldsRaw()));
  readonly activePreviewFormFields = computed(() => {
    const clonedFields = structuredClone(this.activeFormFieldsRaw());
    clonedFields.forEach((f) => this.cleanField(f));
    return clonedFields;
  });
  readonly activeFormFieldsJSON = computed(() =>
    JSON.stringify(this.activePreviewFormFields(), null, 2),
  );

  constructor() {
    this.formStoreService
      .getFormList$(this.editorConfig.editorType)
      .subscribe((formList) => this.formListSrc.set(formList));

    this.refreshHierarchy();

    if (this.autosaveEnabled) {
      this.autosaveTrigger$.pipe(debounceTime(this.autosaveDelay)).subscribe((formId) => {
        if (formId && formId === this.activeFormId()) {
          // this.saveActiveFormTrigger$.next();
          this.saveActiveForm();
        }
      });
    }

    this.saveActiveFormTrigger$
      .pipe(
        map(() => this.activeForm()),
        filter((form) => !!form),
        tap(() => this.saveStatusSrc.set('saving')),
        switchMap((form) => {
          const rawForm = this.convertToRawForm(form);

          return this.formStoreService.updateForm$(this.editorConfig.editorType, rawForm).pipe(
            switchMap(() => this.formStoreService.getFormList$(this.editorConfig.editorType)),
            catchError(() => {
              this.saveStatusSrc.set('error');
              return EMPTY;
            }),
          );
        }),
      )
      .subscribe({
        next: (formList) => {
          this.formListSrc.set(formList);
          this.saveStatusSrc.set('saved');
        },
        error: () => this.saveStatusSrc.set('error'),
      });
  }

  protected markFormDirty(): void {
    this.saveStatusSrc.set('dirty');
    if (this.autosaveEnabled) {
      this.autosaveTrigger$.next(this.activeFormId() ?? null);
    }
  }

  protected refreshHierarchy() {
    if (this.formStoreService.getHierarchy$) {
      this.formStoreService
        .getHierarchy$(this.editorConfig.editorType)
        .subscribe((hierarchy) => this.hierarchySrc.set(hierarchy));
    }
  }

  setMouseEnteredField(fieldId: string): void {
    this.mouseInsideIds.set([...this.mouseInsideIds(), fieldId]);
  }

  setMouseLeftField(fieldId: string): void {
    const ids = this.mouseInsideIds();
    const index = ids.lastIndexOf(fieldId);
    if (index !== -1) {
      this.mouseInsideIds.set(ids.toSpliced(index, 1));
    }
  }

  setActiveFormDisplayMode(mode: 'form' | 'preview' | 'json'): void {
    this.activeFormDisplayModeSrc.set(mode);
  }

  setActiveField(fieldId: string | null): void {
    this.activeFieldIdSrc.set(fieldId);

    const formId = this.activeFormId();
    if (formId) {
      this.activeFieldIdByFormSrc.update((map) => ({
        ...map,
        [formId]: fieldId,
      }));
    }
  }

  setActiveFormName(newName: string): void {
    const form = this.activeForm();
    if (!form) return;

    const newForm = { ...form, name: newName };
    this.activeFormSrc.set(newForm);
    this.markFormDirty();
  }

  setWorkspaceNodeName(nodeId: string, newName: string): void {
    const node = this.hierarchyNodeMap()[nodeId];
    if (!node) return;

    const updated = renameNodeInHierarchy(this.hierarchy(), nodeId, newName);
    this.hierarchySrc.set(updated);

    if (this.formStoreService.saveHierarchy$) {
      this.formStoreService.saveHierarchy$(this.editorConfig.editorType, updated).subscribe();
    }

    if (node.type === 'form') {
      this.formStoreService.getForm$(this.editorConfig.editorType, nodeId).subscribe((rawForm) => {
        if (!rawForm) {
          return;
        }

        rawForm.name = newName;
        this.formStoreService.updateForm$(this.editorConfig.editorType, rawForm).subscribe(() => {
          this.formStoreService
            .getFormList$(this.editorConfig.editorType)
            .subscribe((formList) => this.formListSrc.set(formList));

          if (this.activeFormId() === nodeId) {
            this.setActiveFormName(newName);
          }
        });
      });
    }
  }

  setActiveForm(formId: string | null) {
    if (!formId) {
      this.activeFormSrc.set(null);
      this.activeFieldIdSrc.set(null);
      this.libraryService.setActiveLibrary(null);
      return;
    }

    this.formStoreService.getForm$(this.editorConfig.editorType, formId).subscribe((rawForm) => {
      if (!rawForm) {
        throw new Error(`Error loading form with id: ${formId}`);
      }

      if (!this.libraryService.getLibrary(rawForm.libraryId)) {
        this.activeFormSrc.set(null);
        this.activeFieldIdSrc.set(null);
        this.libraryService.setActiveLibrary(null);
        console.error(`Library config with id "${rawForm.libraryId}" not found.`);
        return;
      }

      const newActiveForm = this.convertFromRawForm(rawForm);
      this.activeFormSrc.set(newActiveForm);
      this.saveStatusSrc.set('saved');

      const restoredFieldId = this.activeFieldIdByFormSrc()[formId];
      if (restoredFieldId && newActiveForm.fieldMap[restoredFieldId]) {
        this.activeFieldIdSrc.set(restoredFieldId);
      } else {
        this.activeFieldIdSrc.set(newActiveForm.rootFieldIds[0] ?? null);
      }

      this.libraryService.setActiveLibrary(rawForm.libraryId);
      this.panelService.setActiveLHSPanel('fields');
    });
  }

  saveActiveForm() {
    this.saveActiveFormTrigger$.next();
  }

  addForm$(
    name: string,
    fields: FormlyFieldConfig[] = [],
    model: Record<string, unknown>,
    libraryId: string,
    setActive = true,
    parentId?: string | null,
  ): Observable<void> {
    // Create Form
    const newRawForm: DefaultForm = {
      id: generateFormId(),
      libraryId: libraryId,
      fieldCount: 0,
      parentId: parentId ?? null,
      name,
      fields,
      model,
    };
    const newForm = this.convertFromRawForm(newRawForm);
    newRawForm.fieldCount = Object.keys(newForm.fieldMap).length;

    return this.formStoreService
      .addForm$(this.editorConfig.editorType, newRawForm)
      .pipe(switchMap(() => this.formStoreService.getFormList$(this.editorConfig.editorType)))
      .pipe(
        tap((formList) => {
          this.formListSrc.set(formList);
          this.refreshHierarchy();
          if (setActive) {
            this.setActiveForm(newForm.id);
            this.panelService.setActiveLHSPanel('fields');
          }
        }),
        map(() => undefined),
      );
  }

  removeForm(formId: string) {
    this.formStoreService
      .removeForm$(this.editorConfig.editorType, formId)
      .pipe(switchMap(() => this.formStoreService.getFormList$(this.editorConfig.editorType)))
      .subscribe((formList) => {
        this.formListSrc.set(formList);
        this.refreshHierarchy();
        this.setActiveForm(null);
      });
  }

  createFolder(name: string, parentId: string | null = null): string {
    const folderId = `folder_${uuidv4().substring(0, 8)}`;
    const parentNode = parentId ? this.hierarchyNodeMap()[parentId] : null;
    const parentPath = parentNode ? parentNode.idPath : [];

    const folderNode: WorkspaceFolderNode = {
      id: folderId,
      name,
      type: 'folder',
      parentId,
      idPath: [...parentPath, folderId],
      childIds: [],
      isExpanded: true,
    };

    const updated = addNodeToHierarchy(this.hierarchy(), folderNode);
    this.hierarchySrc.set(updated);
    if (this.formStoreService.saveHierarchy$) {
      this.formStoreService.saveHierarchy$(this.editorConfig.editorType, updated).subscribe();
    }
    return folderId;
  }

  deleteWorkspaceNode(nodeId: string): void {
    const node = this.hierarchyNodeMap()[nodeId];
    if (!node) return;

    if (node.type === 'form') {
      this.removeForm(nodeId);
      return;
    }

    const { hierarchy: updatedHierarchy, removedNodeIds } = removeNodeFromHierarchy(
      this.hierarchy(),
      nodeId,
    );
    this.hierarchySrc.set(updatedHierarchy);

    if (this.formStoreService.saveHierarchy$) {
      this.formStoreService
        .saveHierarchy$(this.editorConfig.editorType, updatedHierarchy)
        .subscribe();
    }

    for (const removedId of removedNodeIds) {
      if (this.formList().some((f) => f.id === removedId)) {
        this.formStoreService.removeForm$(this.editorConfig.editorType, removedId).subscribe();
      }
      if (this.activeFormId() === removedId) {
        this.setActiveForm(null);
      }
    }

    this.formStoreService
      .getFormList$(this.editorConfig.editorType)
      .subscribe((formList) => this.formListSrc.set(formList));
  }

  moveWorkspaceNode(nodeId: string, targetFolderId: string | null, targetIndex?: number): void {
    try {
      const updated = moveNodeInHierarchy(this.hierarchy(), nodeId, targetFolderId, targetIndex);
      this.hierarchySrc.set(updated);
      if (this.formStoreService.saveHierarchy$) {
        this.formStoreService.saveHierarchy$(this.editorConfig.editorType, updated).subscribe();
      }

      const node = updated.nodeMap[nodeId];
      if (node && node.type === 'form') {
        this.formStoreService
          .getForm$(this.editorConfig.editorType, nodeId)
          .subscribe((rawForm) => {
            if (rawForm) {
              rawForm.parentId = targetFolderId;
              this.formStoreService.updateForm$(this.editorConfig.editorType, rawForm).subscribe();
            }
          });
      }
    } catch (e) {
      console.error('Failed to move workspace node', e);
    }
  }

  renameWorkspaceNode(nodeId: string, newName: string): void {
    this.setWorkspaceNodeName(nodeId, newName);
  }

  toggleFolderExpansion(folderId: string, isExpanded?: boolean): void {
    const updated = toggleFolderExpansion(this.hierarchy(), folderId, isExpanded);
    this.hierarchySrc.set(updated);
    if (this.formStoreService.saveHierarchy$) {
      this.formStoreService.saveHierarchy$(this.editorConfig.editorType, updated).subscribe();
    }
  }

  modifyActiveField(change: PropertyChange): void {
    if (!change.path) {
      throw new Error('Path is missing from field change');
    }

    const form = this.activeForm();
    if (!form) return;

    const activeFieldId = this.activeFieldIdSrc();
    if (!activeFieldId) return;

    const activeField = this.getField(activeFieldId);
    if (!activeField) return;

    const newActiveField = modifyPropertyTarget(activeField, change);
    const newFieldMap = { ...this.activeFieldMap(), [newActiveField._info.id]: newActiveField };

    const newForm = { ...form, fieldMap: newFieldMap };
    this.activeFormSrc.set(newForm);
    this.markFormDirty();
  }

  setActiveModel(newModel: Record<string, unknown>): void {
    const form = this.activeForm();
    if (!form) return;

    const newForm = { ...form, model: newModel };
    this.activeFormSrc.set(newForm);
    this.markFormDirty();
  }

  modifyActiveModel(newModelJSON: string): void {
    const form = this.activeForm();
    if (!form) return;

    const newModel = JSON.parse(newModelJSON);

    const newForm = { ...form, model: newModel };
    this.activeFormSrc.set(newForm);
    this.markFormDirty();
  }

  getField(fieldId: string): EditorField | undefined {
    return this.activeFieldMap()?.[fieldId];
  }

  protected insertId(id: string, arr: string[], index: number | undefined) {
    let newArr: string[];
    if (typeof index === 'number') {
      newArr = [...arr.slice(0, index), id, ...arr.slice(index)];
    } else {
      newArr = [...arr, id];
    }

    return newArr;
  }

  buildField(fieldId: string, fieldMap: Record<string, EditorField>): EditorField {
    const field = fieldMap[fieldId];
    const clonedField: EditorField = structuredClone(field);
    const info = clonedField._info;
    if (info.isFieldArray && info.childIds.length) {
      const fieldArray = this.buildField(info.childIds[0], fieldMap);
      if (fieldArray) {
        clonedField.fieldArray = fieldArray;
      }
    } else if (info.childIds.length) {
      clonedField.fieldGroup = info.childIds
        .map((id) => this.buildField(id, fieldMap))
        .filter((f: EditorField | undefined): f is EditorField => !!f);
    }
    return clonedField;
  }
  cleanField(field: EditorField): void {
    if (field._info.isParent) {
      if (field._info.isFieldArray && field.fieldArray) {
        this.cleanField(field.fieldArray);
      } else if (field.fieldGroup?.length) {
        field.fieldGroup.forEach((f: EditorField) => this.cleanField(f));
      }
    }

    // Remove editor properties
    unset(field, '_info');

    // Remove empty properties
    [
      'wrappers',
      'templateOptions',
      'props',
      'expression',
      'className',
      'fieldGroupClassName',
      'validation.messages',
      'validation',
    ].forEach((p) => {
      if (isEmpty(get(field, p))) {
        unset(field, p);
      }
    });
  }
  getAddOptions(info: FieldInfo): CoreAddFieldOption[] {
    return info.isParent
      ? this.fieldService.activeFieldCategoryOptions().map((category) => ({
          label: category.displayName,
          items: category.children.map((child) => ({
            label: child.displayName,
            type: child.name,
            command: () => this.addField(child.name, info.id),
          })),
        }))
      : [];
  }
  getReplaceOptions(info: FieldInfo): CoreAddFieldOption[] {
    const currentType = this.getField(info.id)?.type;

    return this.fieldService
      .activeFieldCategoryOptions()
      .map((category) => ({
        label: category.displayName,
        items: category.children
          .filter((child) => child.name !== currentType)
          .map((child) => ({
            label: child.displayName,
            type: child.name,
            command: () => this.replaceField(child.name, info.id),
          })),
      }))
      .filter((category) => category.items.length > 0);
  }
  convertFromRawForm({ id, name, libraryId, fields, model }: DefaultForm): EditorForm {
    id = id || generateFormId();
    const fieldMap: Record<string, EditorField> = {};
    const fieldTypeOptions = this.fieldService.getTypeOptions(libraryId);
    const rootFields = fields.map((f) =>
      convertField(
        f,
        generateFieldId(f.type as string),
        id,
        [],
        fieldMap,
        fieldTypeOptions,
        (type: string) => this.fieldService.getDefaultField(type, libraryId),
      ),
    );
    const rootFieldIds = rootFields.map((f) => f._info.id);

    return {
      id,
      name,
      libraryId,
      fieldCount: Object.keys(fieldMap).length,
      fieldMap,
      rootFieldIds,
      model,
    };
  }
  convertToRawForm({
    id,
    libraryId,
    name,
    fieldMap,
    rootFieldIds,
    model,
  }: EditorForm): DefaultForm {
    const fields: EditorField[] = rootFieldIds.map((id) => this.buildField(id, fieldMap));
    fields.forEach((f) => this.cleanField(f));
    return {
      id,
      libraryId: libraryId,
      name,
      fieldCount: Object.keys(fieldMap).length,
      fields,
      model,
    };
  }
  getFieldIndex(fieldId: string): number {
    const field = this.getField(fieldId);
    if (!field) return -1;

    const idPath = field._info.idPath;
    const parentId = idPath[idPath.length - 2];

    if (parentId) {
      const parent = this.getField(parentId);
      if (!parent) return -1;
      return parent._info.childIds.indexOf(fieldId);
    }

    const form = this.activeForm();
    if (!form) return -1;
    return form.rootFieldIds.indexOf(fieldId);
  }
  addField(fieldType: string, parentId?: string, index?: number, preset?: FieldTypePreset): void {
    const form = this.activeForm();
    if (!form) return;

    const activeLibraryId = this.libraryService.activeLibraryId();
    if (!activeLibraryId) {
      throw new Error('No active configuration is set.');
    }

    const newFieldId = generateFieldId(fieldType);
    const newForm = create(form, (draft) => {
      const fieldMap = draft.fieldMap;
      const parent = parentId ? fieldMap[parentId] : undefined;

      // Create new field
      convertField(
        preset?.field ?? this.fieldService.getDefaultField(fieldType, activeLibraryId),
        newFieldId,
        draft.id,
        parent ? parent._info.idPath : [],
        fieldMap as Record<string, EditorField>,
        this.fieldService.activeFieldTypeOptions(),
        (type: string) => this.fieldService.getDefaultField(type, activeLibraryId),
      );

      // Add new field to parent
      if (parent) {
        if (parent._info.isFieldArray) {
          const previousChildId = parent._info.childIds[0];
          const removeRecursively = (fieldId: string) => {
            const field = fieldMap[fieldId];
            if (!field) return;

            field._info.childIds.forEach(removeRecursively);
            delete fieldMap[fieldId];
          };

          if (previousChildId) {
            removeRecursively(previousChildId);
          }
          parent._info.childIds = [newFieldId];
        } else {
          parent._info.childIds = this.insertId(newFieldId, parent._info.childIds, index);
        }
      } else {
        // Add new field as root field
        draft.rootFieldIds = this.insertId(newFieldId, draft.rootFieldIds, index);
      }
    });

    // Set active form and field
    this.activeFormSrc.set(newForm);
    this.markFormDirty();
    this.activeFieldIdSrc.set(newFieldId);
  }
  removeField(fieldId: string): void {
    const form = this.activeForm();
    if (!form) return;
    const field = form.fieldMap[fieldId];
    if (!field) return;
    const activeFieldId = this.activeFieldIdSrc();
    const activeField = activeFieldId ? form.fieldMap[activeFieldId] : undefined;

    const newForm = create(form, (draft) => {
      const fieldMap = draft.fieldMap;
      const field = fieldMap[fieldId];
      const parentId = field._info.idPath[field._info.idPath.length - 2];

      // Remove field from parent's childIds or from rootFieldIds
      if (parentId) {
        const parent = fieldMap[parentId];
        parent._info.childIds = parent._info.childIds.filter((id) => id !== fieldId);
      } else {
        draft.rootFieldIds = draft.rootFieldIds.filter((id) => id !== fieldId);
      }

      clearFieldModelValue(fieldId, fieldMap as Record<string, EditorField>, draft.model);

      // Remove field and its descendants from field map
      const removeRecursively = (id: string) => {
        const field = fieldMap[id];
        if (field) {
          field._info.childIds.forEach(removeRecursively);
          delete fieldMap[id];
        }
      };
      removeRecursively(fieldId);
    });

    // Set active form
    this.activeFormSrc.set(newForm);
    this.markFormDirty();

    // Clear active field if it was removed directly or as part of a removed subtree
    if (activeFieldId === fieldId || activeField?._info.idPath.includes(fieldId)) {
      this.activeFieldIdSrc.set(null);
    }
  }
  moveField(
    fieldId: string,
    fromIndex: number,
    toIndex: number | undefined,
    toParentId?: string | undefined,
  ): void {
    const form = this.activeForm();
    if (!form) return;
    const field = form.fieldMap[fieldId];
    if (!field) return;

    const newForm = create(form, (draft) => {
      const fieldMap = draft.fieldMap;
      const field = fieldMap[fieldId];
      const currentParentId = field._info.idPath[field._info.idPath.length - 2];
      const targetParent = toParentId ? fieldMap[toParentId] : undefined;

      // Prevent moving into self or descendant
      if (targetParent?._info.idPath.includes(fieldId)) {
        return;
      }

      // Remove from current parent or root
      if (currentParentId) {
        const currentParent = fieldMap[currentParentId];
        currentParent._info.childIds = currentParent._info.childIds.filter(
          (id: string) => id !== fieldId,
        );
      } else {
        draft.rootFieldIds = draft.rootFieldIds.filter((id) => id !== fieldId);
      }

      // Insert into target parent or root
      if (targetParent) {
        if (targetParent._info.isFieldArray) {
          targetParent._info.childIds = [fieldId];
        } else {
          let insertIndex =
            typeof toIndex === 'number' ? toIndex : targetParent._info.childIds.length;

          // If reordering within the same parent and the original index was before the target, the removal shifted indices left
          if (currentParentId === targetParent._info.id && fromIndex < insertIndex) {
            insertIndex--;
          }

          targetParent._info.childIds = this.insertId(
            fieldId,
            targetParent._info.childIds,
            insertIndex,
          );
        }
      } else {
        let insertIndex = typeof toIndex === 'number' ? toIndex : draft.rootFieldIds.length;

        // If reordering within root and the original index was before the target, the removal shifted indices left
        if (!currentParentId && fromIndex < insertIndex) {
          insertIndex--;
        }

        draft.rootFieldIds = this.insertId(fieldId, draft.rootFieldIds, insertIndex);
      }

      // Update id path for new field and descendants
      const updateIdPath = (currFieldId: string, parentPath: string[]) => {
        const currField = fieldMap[currFieldId];
        currField._info.idPath = [...parentPath, currFieldId];
        currField._info.childIds.forEach((childId) =>
          updateIdPath(childId, currField._info.idPath),
        );
      };

      updateIdPath(fieldId, targetParent ? targetParent._info.idPath : []);
    });

    if (newForm === form) return;

    this.activeFormSrc.set(newForm);
    this.markFormDirty();
    // keep moved field active
    this.activeFieldIdSrc.set(fieldId);
  }

  replaceField(fieldType: string, fieldId: string): void {
    const form = this.activeForm();
    if (!form) return;

    const field = form.fieldMap[fieldId];
    if (!field || field.type === fieldType) return;

    const activeLibraryId = this.libraryService.activeLibraryId();
    if (!activeLibraryId) {
      throw new Error('No active configuration is set.');
    }

    const fieldTypeOptions = this.fieldService.activeFieldTypeOptions();
    if (!fieldTypeOptions.some((option) => option.name === fieldType)) return;

    const parentId = field._info.idPath[field._info.idPath.length - 2];
    const siblingIds = parentId ? form.fieldMap[parentId]?._info.childIds : form.rootFieldIds;
    const siblingIndex = siblingIds?.indexOf(fieldId) ?? -1;
    if (siblingIndex < 0) return;

    const replacementId = generateFieldId(fieldType);

    const newForm = create(form, (draft) => {
      const fieldMap = draft.fieldMap;
      const oldField = fieldMap[fieldId];
      const parent = parentId ? fieldMap[parentId] : undefined;

      convertField(
        this.fieldService.getDefaultField(fieldType, activeLibraryId),
        replacementId,
        draft.id,
        parent?._info.idPath ?? [],
        fieldMap as Record<string, EditorField>,
        fieldTypeOptions,
        (type: string) => this.fieldService.getDefaultField(type, activeLibraryId),
      );

      const replacement = fieldMap[replacementId];
      const oldChildIds = [...oldField._info.childIds];

      if (oldField.key !== undefined) {
        replacement.key = oldField.key;
      }
      if (oldField.className !== undefined) {
        replacement.className = oldField.className;
      }
      if (oldField.fieldGroupClassName !== undefined) {
        replacement.fieldGroupClassName = oldField.fieldGroupClassName;
      }

      const canTransferChildren = oldField._info.isParent && replacement._info.isParent;

      const removeSubtree = (id: string) => {
        const child = fieldMap[id];
        if (!child) return;

        child._info.childIds.forEach(removeSubtree);
        delete fieldMap[id];
      };

      if (canTransferChildren) {
        replacement._info.childIds.forEach(removeSubtree);
        const transferredChildIds = replacement._info.isFieldArray
          ? oldChildIds.slice(0, 1)
          : oldChildIds;
        const transferredChildIdSet = new Set(transferredChildIds);

        oldChildIds.filter((childId) => !transferredChildIdSet.has(childId)).forEach(removeSubtree);
        replacement._info.childIds = transferredChildIds;

        const updateIdPath = (id: string, parentPath: string[]) => {
          const child = fieldMap[id];
          if (!child) return;

          child._info.idPath = [...parentPath, id];
          child._info.childIds.forEach((childId) => updateIdPath(childId, child._info.idPath));
        };

        oldChildIds.forEach((childId) => updateIdPath(childId, replacement._info.idPath));
      } else {
        oldChildIds.forEach(removeSubtree);
      }

      if (parent) {
        parent._info.childIds[siblingIndex] = replacementId;
      } else {
        draft.rootFieldIds[siblingIndex] = replacementId;
      }

      clearFieldModelValue(fieldId, fieldMap as Record<string, EditorField>, draft.model);
      delete fieldMap[fieldId];
    });

    this.activeFormSrc.set(newForm);
    this.markFormDirty();
    this.activeFieldIdSrc.set(replacementId);
  }
}
