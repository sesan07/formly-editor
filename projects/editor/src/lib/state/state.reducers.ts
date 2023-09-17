import { moveItemInArray } from '@angular/cdk/drag-drop';
import { createFeature, createReducer, on } from '@ngrx/store';
import { cloneDeep, unset } from 'lodash-es';
import { IEditorFormlyField, IForm } from '../editor.types';
import { convertToEditorField, generateFormId } from './state.utils';
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
    { name, sourceFields, model, getDefaultField, typeOptions, defaultUnknownType }: AddForm
): IEditorState => {
    const id = generateFormId(state.formIdCounter + 1);
    const counter = { count: 0 };
    const baseFields = (sourceFields ?? []).map(field =>
        convertToEditorField(getDefaultField, typeOptions, counter, id, field, undefined, defaultUnknownType)
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
    const id = generateFormId(state.formIdCounter + 1);
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
    { fieldType, parent, index, getDefaultField, typeOptions, defaultUnknownType }: AddField
): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    const counter = { count: activeForm.fieldIdCounter };
    const field = convertToEditorField(
        getDefaultField,
        typeOptions,
        counter,
        activeForm.id,
        getDefaultField(fieldType),
        parent,
        defaultUnknownType
    );

    let baseFields = activeForm.baseFields;
    if (parent) {
        let siblings: IEditorFormlyField | IEditorFormlyField[] = getFieldChildren(parent);
        if (Array.isArray(siblings)) {
            siblings = [...siblings];
            index = typeof index === 'number' ? index : siblings.length;
            siblings.splice(index, 0, field);
            parent = setFieldChildren({ ...parent }, siblings);
        } else {
            parent = setFieldChildren({ ...parent }, field);
        }

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

const processRemoveField = (state: IEditorState, { fieldId, parent, keyPath }: RemoveField): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    let baseFields = activeForm.baseFields;
    if (parent) {
        let siblings: IEditorFormlyField | IEditorFormlyField[] = getFieldChildren(parent);
        if (Array.isArray(siblings)) {
            siblings = siblings.filter(f => f._info.fieldId !== fieldId);
            parent = setFieldChildren(parent, siblings);
        } else {
            parent = setFieldChildren(parent, undefined);
        }

        baseFields = modifyFields(activeForm.baseFields, parent);
    } else {
        baseFields = baseFields.filter(f => f._info.fieldId !== fieldId);
    }

    let model = activeForm.model;
    if (keyPath) {
        model = cloneDeep(model);
        unset(model, keyPath);
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
                model,
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
    { field, parent, newFieldType, typeOptions, defaultUnknownType, keyPath, getDefaultField }: ReplaceField
): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    const counter = { count: activeForm.fieldIdCounter };
    const newField = convertToEditorField(
        getDefaultField,
        typeOptions,
        counter,
        activeForm.id,
        getDefaultField(newFieldType),
        parent,
        defaultUnknownType
    );
    // Copy properties that shouldn't change
    newField.key = field.key || newField.key;
    newField.className = field.className;
    newField.fieldGroupClassName = field.fieldGroupClassName;

    // Copy children to new field's children
    if (newField._info.childrenConfig && field._info.childrenConfig) {
        const getNewChild = (f: IEditorFormlyField) => ({
            ...f,
            _info: {
                ...f._info,
                parentFieldId: newField._info.fieldId,
            },
        });

        let children = getFieldChildren(field);
        let newChildren: IEditorFormlyField | IEditorFormlyField[];
        if (Array.isArray(children)) {
            children = children.map(f => getNewChild(f));
            newChildren = newField._info.childrenConfig.isObject ? children[0] : children;
        } else if (children) {
            children = getNewChild(children);
            newChildren = newField._info.childrenConfig.isObject ? children : [children];
        }

        setFieldChildren(newField, newChildren);
    }

    let baseFields = activeForm.baseFields;
    if (parent) {
        let siblings: IEditorFormlyField | IEditorFormlyField[] = getFieldChildren(parent);
        if (Array.isArray(siblings)) {
            const index: number = siblings.findIndex(f => f._info.fieldId === field._info.fieldId);
            siblings = siblings.filter(f => f._info.fieldId !== field._info.fieldId);
            siblings.splice(index, 0, newField);
            parent = setFieldChildren({ ...parent }, siblings);
        } else {
            parent = setFieldChildren({ ...parent }, newField);
        }

        baseFields = modifyFields(activeForm.baseFields, parent);
    } else {
        const index: number = baseFields.findIndex(f => f._info.fieldId === field._info.fieldId);
        baseFields = baseFields.filter(f => f._info.fieldId !== field._info.fieldId);
        baseFields.splice(index, 0, newField);
    }

    let model = activeForm.model;
    if (keyPath) {
        model = cloneDeep(model);
        unset(model, keyPath);
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
                model,
            },
        },
    };
};

const processMoveField = (state: IEditorState, { parent, from, to }: MoveField): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    let baseFields: IEditorFormlyField[];
    if (parent) {
        let children: IEditorFormlyField[] = getFieldChildren(parent) as IEditorFormlyField[];
        if (Array.isArray(children)) {
            children = [...children];
        } else {
            throw new Error('Cannot move field in an object parent');
        }
        parent = setFieldChildren({ ...parent }, children);
        to = typeof to === 'number' ? to : children.length;
        moveItemInArray(children, from, to);
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
            model = change.path.length ? modifyValue(model, change) : { ...change.value };
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
