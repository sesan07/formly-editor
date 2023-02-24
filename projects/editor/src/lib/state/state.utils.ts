import { get, isNil, set } from 'lodash-es';
import { IEditorFormlyField, IFormOverride } from '../editor.types';
import { setFieldChildren, getFieldChildren } from '../form/form.utils';
import produce from 'immer';
import { getFieldId } from '../editor.utils';
import { IPropertyChange } from '../property/property.types';

export const duplicateFields = (
    fields: IEditorFormlyField[],
    formId: string,
    parentFieldId?: string,
    counter = { count: 0 }
) =>
    fields.map(field => {
        const fieldId = getFieldId(field.type, counter.count++);
        return {
            ...field,
            _info: {
                ...field._info,
                parentFieldId,
                formId,
                fieldId,
            },
            ...(field._info.canHaveChildren
                ? set({}, field._info.childrenPath, duplicateFields(getFieldChildren(field), formId, fieldId, counter))
                : {}),
        };
    });

export const modifyFields = (
    fields: IEditorFormlyField[],
    changedField: IEditorFormlyField,
    level: number = 0
): IEditorFormlyField[] => {
    const fieldPath = changedField._info.fieldPath;
    const fieldId = fieldPath[level];

    if (level === fieldPath.length - 1) {
        return fields.map(f => (f._info.fieldId === fieldId ? changedField : f));
    }

    return fields.map(f =>
        f._info.fieldId === fieldId
            ? setFieldChildren({ ...f }, modifyFields([...getFieldChildren(f)], changedField, level + 1))
            : f
    );
};

export const getFieldMap = (field: IEditorFormlyField): Record<string, IEditorFormlyField> => {
    const fieldInfo = field._info;
    const fieldMap: Record<string, IEditorFormlyField> = { [fieldInfo.fieldId]: field };

    // Process children (e.g. 'fieldGroup')
    if (fieldInfo.canHaveChildren) {
        const children: IEditorFormlyField[] = getFieldChildren(field);
        return children.reduce((a, child) => ({ ...a, ...getFieldMap(child) }), fieldMap);
    }

    return fieldMap;
};

export const modifyKey = <T extends Record<string, any>>(
    target: T,
    { path, data: newKey, childPath, deleteChildPath }: IPropertyChange
): T =>
    produce(target, draft => {
        const isModifyingChild = !isNil(childPath) || !isNil(deleteChildPath);
        if (isModifyingChild) {
            const parent = get(draft, path) ?? {};
            delete parent[deleteChildPath];

            if (!isNil(childPath)) {
                parent[childPath] = newKey;
            }

            set(draft, path, parent);
        } else {
            const pathArr: string[] = path.split('.');
            const currKey = pathArr.pop();
            let parent = pathArr.length ? get(draft, pathArr) : draft;
            parent = Object.entries(parent)
                .map(([k, v]): [string, unknown] => (k === currKey ? [newKey, v] : [k, v]))
                .reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

            return pathArr.length ? set(draft, pathArr, parent) : parent;
        }
    });

export const modifyValue = <T extends Record<string, any>>(
    target: T,
    { path, data: newValue, childPath }: IPropertyChange
): T =>
    produce(target, draft => {
        if (typeof childPath === 'string') {
            const parent = get(draft, path) ?? {};
            parent[childPath] = newValue;
        } else {
            set(draft, path, newValue);
        }
    });

export const updateParentFieldId = (field: IEditorFormlyField, parentFieldId: string) => {
    field = {
        ...field,
        _info: {
            ...field._info,
            parentFieldId,
        },
    };
};

export const modifyOverrideKey = (
    formOverride: IFormOverride,
    field: IEditorFormlyField,
    fieldMap: Record<string, IEditorFormlyField>,
    { path, data: newKey, childPath, deleteChildPath }: IPropertyChange
): IFormOverride =>
    produce(formOverride, draft => {
        const keyPath = getKeyPath(field, fieldMap);
        const fieldOverride = draft.override[keyPath] ?? {};

        const isModifyingChild = !isNil(childPath) || !isNil(deleteChildPath);
        if (isModifyingChild) {
            const parent = get(fieldOverride, path) ?? {};
            delete parent[deleteChildPath];

            if (!isNil(childPath)) {
                parent[childPath] = newKey;
            }

            set(fieldOverride, path, parent);
        }
        draft.override[keyPath] = fieldOverride;
    });

export const modifyOverrideValue = (
    formOverride: IFormOverride,
    field: IEditorFormlyField,
    fieldMap: Record<string, IEditorFormlyField>,
    { path, data: newValue, childPath }: IPropertyChange
): IFormOverride =>
    produce(formOverride, draft => {
        const keyPath = getKeyPath(field, fieldMap);
        const fieldOverride = draft.override[keyPath] ?? {};
        if (!isNil(childPath)) {
            const parent = get(fieldOverride, path) ?? {};
            parent[childPath] = newValue;
            set(fieldOverride, path, parent);
        } else {
            const pathArr = path.split('.');
            const numberKeyIndex = pathArr.findIndex(k => !isNaN(Number(k)));
            if (numberKeyIndex > 0) {
                path = pathArr.slice(0, numberKeyIndex).join('.');
                newValue = immerSet(get(field, path), pathArr.slice(numberKeyIndex), newValue);
            }
            set(fieldOverride, path, newValue);
        }
        draft.override[keyPath] = fieldOverride;
    });

export const immerSet = <T extends Record<string, unknown>>(target: T, path: string | string[], value: unknown): T =>
    produce(target, draft => set(draft, path, value));

export const getKeyPath = (
    field: IEditorFormlyField,
    fieldMap: Record<string, IEditorFormlyField>,
    path: string = ''
): string => {
    const fieldInfo = field._info;
    if (fieldInfo.parentFieldId) {
        const parent: IEditorFormlyField = fieldMap[fieldInfo.parentFieldId];
        path += getKeyPath(parent, fieldMap, path);
    }

    const key: string = field.key?.toString();
    if (key) {
        path = path ? `${path}.${key}` : key;
    }

    return path;
};
