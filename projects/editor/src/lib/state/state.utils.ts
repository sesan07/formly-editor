import { get, set, unset } from 'lodash-es';
import { IEditorFormlyField } from '../editor.types';
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

export const modifyKey = <T extends Record<string, any>>(target: T, { path, newPath }: IPropertyChange): T =>
    produce(target, draft => {
        if (newPath) {
            set(draft, newPath, get(draft, path));

            // Clear previous key if new path isn't empty
            if (newPath.slice(-1)[0]) {
                unset(draft, path);
            }
        } else {
            unset(draft, path);
        }
    });

export const modifyValue = <T extends Record<string, any>>(target: T, { path, value }: IPropertyChange): T =>
    produce(target, draft => {
        set(draft, path, value);
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
