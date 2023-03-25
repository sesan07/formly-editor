import { moveItemInArray } from '@angular/cdk/drag-drop';
import { createFeature, createReducer, on } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { IEditorFormlyField, IForm } from '../editor.types';
import { convertToEditorField, getFormId } from '../editor.utils';
import { getFieldChildren, setFieldChildren } from '../form/form.utils';
import { PropertyChangeType } from '../property/property.types';
import {
    addForm,
    setEditMode,
    modifyActiveField,
    setActiveField,
    setActiveFormId,
    addField,
    setActiveModel,
    modifyActiveModel,
    AddForm,
    AddField,
    SetEditMode,
    ModifyActiveField,
    SetActiveField,
    ModifyActiveModel,
    SetActiveModel,
    MoveField,
    moveField,
    removeField,
    RemoveField,
    SetActiveFormId,
    RemoveForm,
    removeForm,
    DuplicateForm,
    duplicateForm,
    ReplaceField,
    replaceField,
} from './state.actions';
import { IEditorState } from './state.types';
import { duplicateFields, modifyFields, modifyKey, modifyValue } from './state.utils';

export const initialState: IEditorState = {
    formMap: {},
    activeFormId: null,
    formIdCounter: 0,
};

const processAddForm = (
    state: IEditorState,
    { name, sourceFields, model, getDefaultField, typeOptions, unknownTypeName }: AddForm
): IEditorState => {
    const id = getFormId(state.formIdCounter + 1);
    const counter = { count: 0 };
    const baseFields = (sourceFields ?? []).map(field =>
        convertToEditorField(getDefaultField, typeOptions, counter, id, field, undefined, unknownTypeName)
    );
    return {
        ...state,
        formMap: {
            ...state.formMap,
            [id]: {
                id,
                name,
                fields: baseFields,
                baseFields,
                model: model ?? {},
                activeFieldId: baseFields[0]?._info.fieldId,
                isEditMode: true,
                fieldIdCounter: counter.count,
            },
        },
        activeFormId: id,
        formIdCounter: state.formIdCounter + 1,
    };
};

const processRemoveForm = (state: IEditorState, { formId }: RemoveForm): IEditorState => {
    const formMap = { ...state.formMap };
    delete formMap[formId];

    return {
        ...state,
        formMap,
    };
};

const processDuplicateForm = (state: IEditorState, { formId }: DuplicateForm): IEditorState => {
    const sourceForm = state.formMap[formId];
    const id = getFormId(state.formIdCounter + 1);
    const baseFields = duplicateFields(sourceForm.baseFields, id);

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [id]: {
                ...sourceForm,
                id,
                name: `${sourceForm.name} Copy`,
                fields: baseFields,
                baseFields,
                activeFieldId: baseFields[0]?._info.fieldId,
                isEditMode: true,
            },
        },
        activeFormId: id,
        formIdCounter: state.formIdCounter + 1,
    };
};

const processSetActiveFormId = (state: IEditorState, { activeFormId }: SetActiveFormId): IEditorState => ({
    ...state,
    activeFormId,
});

const processAddField = (
    state: IEditorState,
    { fieldType, customType, parent, index, getDefaultField, typeOptions, unknownTypeName }: AddField
): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    const counter = { count: activeForm.fieldIdCounter };
    const field = convertToEditorField(
        getDefaultField,
        typeOptions,
        counter,
        activeForm.id,
        getDefaultField(fieldType, customType),
        parent,
        unknownTypeName
    );

    let baseFields = activeForm.baseFields;
    if (parent) {
        const siblings: IEditorFormlyField[] = [...getFieldChildren(parent)];
        index = typeof index === 'number' ? index : siblings.length;
        siblings.splice(index, 0, field);
        parent = setFieldChildren({ ...parent }, siblings);
        baseFields = modifyFields(activeForm.baseFields, parent);
    } else {
        baseFields = [...baseFields, field];
    }

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                fields: baseFields,
                baseFields,
                activeFieldId: field._info.fieldId,
                fieldIdCounter: counter.count,
            },
        },
    };
};

const processRemoveField = (state: IEditorState, { fieldId, parent }: RemoveField): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    let baseFields = activeForm.baseFields;
    if (parent) {
        const siblings: IEditorFormlyField[] = getFieldChildren(parent).filter(f => f._info.fieldId !== fieldId);
        parent = setFieldChildren({ ...parent }, siblings);
        baseFields = modifyFields(activeForm.baseFields, parent);
    } else {
        baseFields = baseFields.filter(f => f._info.fieldId !== fieldId);
    }

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                fields: baseFields,
                baseFields,
                activeFieldId: parent?._info.fieldId ?? baseFields[0]?._info.fieldId,
            },
        },
    };
};

const processSetEditMode = (state: IEditorState, { formId, isEditMode }: SetEditMode): IEditorState => ({
    ...state,
    formMap: {
        ...state.formMap,
        [state.activeFormId]: {
            ...state.formMap[state.activeFormId],
            isEditMode,
        },
    },
});

const processModifyActiveField = (state: IEditorState, { activeField, change }: ModifyActiveField): IEditorState => {
    const activeForm = state.formMap[state.activeFormId];

    switch (change.type) {
        case PropertyChangeType.KEY:
            activeField = modifyKey(activeField, change);
            break;
        case PropertyChangeType.VALUE:
            activeField = modifyValue(activeField, change);
            break;
    }

    const baseFields = modifyFields(activeForm.baseFields, activeField);
    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                fields: baseFields,
                baseFields,
            },
        },
    };
};

const processSetActiveField = (state: IEditorState, { activeFieldId }: SetActiveField): IEditorState => ({
    ...state,
    formMap: {
        ...state.formMap,
        [state.activeFormId]: {
            ...state.formMap[state.activeFormId],
            activeFieldId,
        },
    },
});

const processReplaceField = (
    state: IEditorState,
    { field, parent, fieldType, customType, typeOptions, unknownTypeName, getDefaultField }: ReplaceField
): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    const counter = { count: activeForm.fieldIdCounter };
    const newField = convertToEditorField(
        getDefaultField,
        typeOptions,
        counter,
        activeForm.id,
        getDefaultField(fieldType, customType),
        parent,
        unknownTypeName
    );
    // Copy properties that shouldn't change
    newField.key = field.key || newField.key;
    newField.className = field.className;
    newField.fieldGroupClassName = field.fieldGroupClassName;

    // Copy children to new field's children
    if (field._info.canHaveChildren) {
        const newChildren = getFieldChildren(field).map(f => ({
            ...f,
            _info: {
                ...f._info,
                parentFieldId: newField._info.fieldId,
            },
        }));
        setFieldChildren(newField, newChildren);
    }

    let baseFields = activeForm.baseFields;
    let siblings: IEditorFormlyField[] = parent ? getFieldChildren(parent) : baseFields;
    const index: number = siblings.findIndex(f => f._info.fieldId === field._info.fieldId);
    siblings = siblings.filter(f => f._info.fieldId !== field._info.fieldId);
    siblings.splice(index, 0, newField);

    if (parent) {
        parent = setFieldChildren({ ...parent }, siblings);
        baseFields = modifyFields(activeForm.baseFields, parent);
    } else {
        baseFields = siblings;
    }

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                fields: baseFields,
                baseFields,
                fieldIdCounter: counter.count,
                activeFieldId: newField._info.fieldId,
            },
        },
    };
};

const processMoveField = (state: IEditorState, { parent, from, to }: MoveField): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    let baseFields: IEditorFormlyField[];
    if (parent) {
        const siblings: IEditorFormlyField[] = [...getFieldChildren(parent)];
        parent = setFieldChildren({ ...parent }, siblings);
        to = typeof to === 'number' ? to : siblings.length;
        moveItemInArray(siblings, from, to);
        baseFields = modifyFields(activeForm.baseFields, parent);
    } else {
        baseFields = [...activeForm.baseFields];
        to = typeof to === 'number' ? to : baseFields.length;
        moveItemInArray(baseFields, from, to);
    }

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                fields: baseFields,
                baseFields,
            },
        },
    };
};

const processModifyActiveModel = (state: IEditorState, { change }: ModifyActiveModel): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    let model: Record<string, unknown> = activeForm.model;
    switch (change.type) {
        case PropertyChangeType.KEY:
            model = modifyKey(model, change);
            break;
        case PropertyChangeType.VALUE:
            model = change.path ? modifyValue(model, change) : { ...change.data };
            break;
    }

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                model,
            },
        },
    };
};

const processSetActiveModel = (state: IEditorState, { model }: SetActiveModel): IEditorState => ({
    ...state,
    formMap: {
        ...state.formMap,
        [state.activeFormId]: {
            ...state.formMap[state.activeFormId],
            model: { ...model },
        },
    },
});

const newReducer = createReducer(
    initialState,
    on(addForm, processAddForm),
    on(removeForm, processRemoveForm),
    on(duplicateForm, processDuplicateForm),
    on(setActiveFormId, processSetActiveFormId),
    on(addField, processAddField),
    on(removeField, processRemoveField),
    on(setEditMode, processSetEditMode),
    on(modifyActiveField, processModifyActiveField),
    on(setActiveField, processSetActiveField),
    on(replaceField, processReplaceField),
    on(moveField, processMoveField),
    on(modifyActiveModel, processModifyActiveModel),
    on(setActiveModel, processSetActiveModel)
);

export const editorFeature = createFeature({
    name: 'editor',
    reducer: newReducer,
});
