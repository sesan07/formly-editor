import { createFeature, createReducer, on } from '@ngrx/store';
import { cloneDeep, unset } from 'lodash-es';
import { IEditorFormlyField, IForm } from '../editor.types';
import { getFieldChildren, setFieldChildren } from '../form/form.utils';
import { PropertyChangeType } from '../property/property.types';
import {
    AddField,
    AddForm,
    DuplicateForm,
    ModifyActiveField,
    ModifyActiveModel,
    MoveField,
    RemoveField,
    RemoveForm,
    ReplaceField,
    SetActiveField,
    SetActiveFormId,
    SetActiveModel,
    SetEditMode,
    addField,
    addForm,
    duplicateForm,
    modifyActiveField,
    modifyActiveModel,
    moveField,
    removeField,
    removeForm,
    replaceField,
    setActiveField,
    setActiveFormId,
    setActiveModel,
    setEditMode,
} from './state.actions';
import { IEditorState } from './state.types';
import {
    convertToEditorField,
    duplicateFields,
    generateFormId,
    getField,
    modifyField,
    modifyFields,
    modifyKey,
    modifyValue,
    moveFieldInArray,
    unsetPath,
} from './state.utils';

export const initialState: IEditorState = {
    formMap: {},
    activeFormId: null,
};

const processAddForm = (
    state: IEditorState,
    { name, sourceFields, model, getDefaultField, typeOptions, defaultTypeOption }: AddForm
): IEditorState => {
    const id = generateFormId();
    const baseFields = (sourceFields ?? []).map(field =>
        convertToEditorField(getDefaultField, typeOptions, defaultTypeOption, id, field)
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
            },
        },
        activeFormId: id,
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
    const id = generateFormId();
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
    };
};

const processSetActiveFormId = (state: IEditorState, { activeFormId }: SetActiveFormId): IEditorState => ({
    ...state,
    activeFormId,
});

const processAddField = (
    state: IEditorState,
    { fieldType, parent, index, getDefaultField, typeOptions, defaultTypeOption }: AddField
): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    const field = convertToEditorField(
        getDefaultField,
        typeOptions,
        defaultTypeOption,
        activeForm.id,
        getDefaultField(fieldType),
        parent
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
    { field, parent, newFieldType, typeOptions, defaultTypeOption, keyPath, getDefaultField }: ReplaceField
): IEditorState => {
    const activeForm: IForm = state.formMap[state.activeFormId];
    const newField = convertToEditorField(
        getDefaultField,
        typeOptions,
        defaultTypeOption,
        activeForm.id,
        getDefaultField(newFieldType),
        parent
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
        model = unsetPath(model, keyPath);
    }

    return {
        ...state,
        formMap: {
            ...state.formMap,
            [activeForm.id]: {
                ...activeForm,
                fields: baseFields,
                baseFields,
                activeFieldId: newField._info.fieldId,
                model,
            },
        },
    };
};

const processMoveField = (
    state: IEditorState,
    { sourceField, sourceParent, targetParent, sourceIndex, targetIndex }: MoveField
): IEditorState => {
    const activeForm = state.formMap[state.activeFormId];
    const sourceParentId = sourceParent?._info.fieldId;
    const targetParentId = targetParent?._info.fieldId;
    let sourceChildren = sourceParent ? getFieldChildren(sourceParent) : undefined;
    let targetChildren = targetParent ? getFieldChildren(targetParent) : undefined;
    let baseFields = [...activeForm.baseFields];
    targetIndex = typeof targetIndex === 'number' ? targetIndex : 0;

    const updateObjectSource = () => {
        sourceParent = setFieldChildren(sourceParent, undefined);
        baseFields = modifyFields(baseFields, sourceParent);
    };

    const updateArraySource = () => {
        sourceChildren = [...(sourceChildren as IEditorFormlyField[])];
        sourceChildren.splice(sourceIndex, 1);
        sourceParent = setFieldChildren(sourceParent, sourceChildren);
        baseFields = modifyFields(baseFields, sourceParent);
    };

    const updateObjectTarget = () => {
        // Make sure targetParent is up to date (in case targetParent was inside sourceParent)
        targetParent = getField(targetParent._info.fieldPath, baseFields);
        targetParent = setFieldChildren(targetParent, modifyField(sourceField, targetParent._info.fieldPath));
        baseFields = modifyFields(baseFields, targetParent);
    };

    const updateArrayTarget = () => {
        // Make sure targetParent is up to date (in case targetParent was inside sourceParent)
        targetParent = getField(targetParent._info.fieldPath, baseFields);
        targetChildren = [...(getFieldChildren(targetParent) as IEditorFormlyField[])];
        targetChildren.splice(targetIndex, 0, modifyField(sourceField, targetParent._info.fieldPath));
        targetParent = setFieldChildren(targetParent, targetChildren);
        baseFields = modifyFields(baseFields, targetParent);
    };

    // If source and target are root fields
    if (!sourceParentId && !targetParentId) {
        moveFieldInArray(baseFields, sourceIndex, targetIndex);
    } else if (sourceParentId && targetParentId) {
        if (sourceParentId === targetParentId) {
            let children = getFieldChildren(sourceParent);
            if (Array.isArray(children)) {
                children = [...children];
                moveFieldInArray(children, sourceIndex, targetIndex);

                sourceParent = setFieldChildren(sourceParent, children);
                baseFields = modifyFields(baseFields, sourceParent);
            }
        } else {
            if (Array.isArray(sourceChildren) && Array.isArray(targetChildren)) {
                updateArraySource();
                updateArrayTarget();
            } else if (Array.isArray(sourceChildren)) {
                updateArraySource();
                updateObjectTarget();
            } else if (Array.isArray(targetChildren)) {
                updateObjectSource();
                updateArrayTarget();
            } else {
                updateObjectSource();
                updateObjectTarget();
            }
        }
    } else if (sourceParentId && !targetParentId) {
        if (Array.isArray(sourceChildren)) {
            updateArraySource();
        } else {
            updateObjectSource();
        }

        baseFields.splice(targetIndex, 0, modifyField(sourceField, undefined));
    } else if (!sourceParentId && targetParentId) {
        baseFields.splice(sourceIndex, 1);

        if (Array.isArray(targetChildren)) {
            updateArrayTarget();
        } else {
            updateObjectTarget();
        }
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
    let model: object = activeForm.model;
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

const editorReducer = createReducer(
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
    reducer: editorReducer,
});
