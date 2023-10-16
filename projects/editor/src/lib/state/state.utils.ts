import produce from 'immer';
import { get, merge, set, unset } from 'lodash-es';
import {
    EditorFieldType,
    FieldTypeOption,
    GetDefaultField,
    IBaseFormlyField,
    IEditorFieldInfo,
    IEditorFormlyField,
} from '../editor.types';
import { getFieldChildren, setFieldChildren } from '../form/form.utils';
import { IPropertyChange } from '../property/property.types';

import { nanoid } from 'nanoid';

export const generateFormId = (): string => `form__${nanoid()}`;
const generateFieldId = (type: string): string => `${type}__${nanoid()}`;
const generateFieldKey = (prefix?: string): string => `${prefix ? `${prefix}_` : ''}${nanoid(3)}`;

export const convertToEditorField = (
    getDefaultField: GetDefaultField,
    typeOptions: FieldTypeOption[],
    defaultTypeOption: FieldTypeOption,
    formId: string,
    sourceField: IBaseFormlyField,
    parent?: IEditorFormlyField
) => {
    // Special case to specify 'formly-group' type
    if (!sourceField.type && sourceField.fieldGroup) {
        sourceField = {
            ...sourceField,
            type: EditorFieldType.FORMLY_GROUP,
        };
    }

    // Merge with default properties
    const typeOption: FieldTypeOption =
        typeOptions.find(option => option.type === sourceField.type) ?? defaultTypeOption;
    const baseField: IBaseFormlyField = getDefaultField(sourceField.type);
    merge(baseField, sourceField);

    // Editor information
    const fieldId = generateFieldId(baseField.type);
    const fieldInfo: IEditorFieldInfo = {
        name: typeOption.displayName,
        formId,
        fieldId,
        parentFieldId: parent?._info.fieldId,
        fieldPath: parent ? [...parent._info.fieldPath, fieldId] : [fieldId],
        childrenConfig: typeOption.childrenConfig,
    };

    // Create field
    const field: IEditorFormlyField = {
        ...baseField,
        _info: fieldInfo,
        key:
            baseField.key ||
            (typeOption.disableKeyGeneration ? undefined : generateFieldKey(typeOption.keyGenerationPrefix)),
        fieldGroup: undefined,
    };

    // Process children (e.g. 'fieldGroup')
    if (fieldInfo.childrenConfig) {
        const baseChildren: IBaseFormlyField | IBaseFormlyField[] = get(baseField, fieldInfo.childrenConfig.path);
        let children: IEditorFormlyField | IEditorFormlyField[];
        if (Array.isArray(baseChildren)) {
            children = baseChildren?.map(child =>
                convertToEditorField(getDefaultField, typeOptions, defaultTypeOption, formId, child, field)
            );
        } else {
            children = convertToEditorField(
                getDefaultField,
                typeOptions,
                defaultTypeOption,
                formId,
                baseChildren,
                field
            );
        }
        set(field, fieldInfo.childrenConfig.path, children);
    }

    return field;
};

export const getField = (fieldPath: string[], fields: IEditorFormlyField | IEditorFormlyField[]): IEditorFormlyField =>
    Array.isArray(fields) ? getFieldFromArray(fieldPath, fields) : getFieldFromObject(fieldPath, fields);

const getFieldFromArray = (fieldPath: string[], fields: IEditorFormlyField[]): IEditorFormlyField => {
    const targetId = fieldPath[0];
    const field = fields.find(f => f._info.fieldId === targetId);
    if (fieldPath.length === 1) {
        return field;
    }

    return field ? getField(fieldPath.slice(1), getFieldChildren(field)) : undefined;
};

const getFieldFromObject = (fieldPath: string[], field: IEditorFormlyField): IEditorFormlyField => {
    if (fieldPath.length === 1) {
        return field;
    }

    return getField(fieldPath.slice(1), getFieldChildren(field));
};

export const modifyField = (field: IEditorFormlyField, parentFieldPath: string[] | undefined): IEditorFormlyField => {
    field = {
        ...field,
        _info: {
            ...field._info,
            parentFieldId: [...(parentFieldPath ?? [])].pop(),
            fieldPath: [...(parentFieldPath ?? []), field._info.fieldId],
        },
    };

    if (field._info.childrenConfig) {
        let children = getFieldChildren(field);
        if (Array.isArray(children)) {
            children = children.map(c => modifyField(c, field._info.fieldPath));
        } else if (children) {
            children = modifyField(children, field._info.fieldPath);
        }
        setFieldChildren(field, children);
    }

    return field;
};

export const moveFieldInArray = (target: IEditorFormlyField[], sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) {
        return;
    }

    const field = target[sourceIndex];
    if (targetIndex < sourceIndex) {
        target.splice(sourceIndex, 1);
        target.splice(targetIndex, 0, field);
    } else {
        target.splice(targetIndex, 0, field);
        target.splice(sourceIndex, 1);
    }
};

export const duplicateFields = (
    fields: IEditorFormlyField | IEditorFormlyField[],
    formId: string,
    parentFieldPath?: string[]
) =>
    Array.isArray(fields)
        ? fields.map(field => duplicateFieldObject(field, formId, parentFieldPath))
        : duplicateFieldObject(fields, formId, parentFieldPath);

const duplicateFieldObject = (field: IEditorFormlyField, formId: string, parentFieldPath: string[] | undefined) => {
    const fieldId = generateFieldId(field.type);
    const fieldPath = [...(parentFieldPath ?? []), fieldId];
    return {
        ...field,
        _info: {
            ...field._info,
            parentFieldId: [...(parentFieldPath ?? [])].pop(),
            formId,
            fieldId,
            fieldPath,
        },
        ...(field._info.childrenConfig
            ? set({}, field._info.childrenConfig.path, duplicateFields(getFieldChildren(field), formId, fieldPath))
            : {}),
    };
};

export const modifyFields = <T extends IEditorFormlyField | IEditorFormlyField[]>(
    fields: T,
    changedField: IEditorFormlyField,
    level: number = 0
): T =>
    Array.isArray(fields)
        ? (modifyFieldArray(fields, changedField, level) as T)
        : (modifyFieldObject(fields, changedField, level) as T);

const modifyFieldArray = (fields: IEditorFormlyField[], changedField: IEditorFormlyField, level: number = 0) => {
    const fieldPath = changedField._info.fieldPath;
    const fieldId = fieldPath[level];

    if (level === fieldPath.length - 1) {
        return fields.map(f => (f._info.fieldId === fieldId ? changedField : f));
    }

    return fields.map(f =>
        f._info.fieldId === fieldId
            ? setFieldChildren(f, modifyFields(getFieldChildren(f), changedField, level + 1))
            : f
    );
};

const modifyFieldObject = (field: IEditorFormlyField, changedField: IEditorFormlyField, level: number = 0) => {
    const fieldPath = changedField._info.fieldPath;
    const fieldId = fieldPath[level];

    if (level === fieldPath.length - 1) {
        return field._info.fieldId === fieldId ? changedField : field;
    }

    return field._info.fieldId === fieldId
        ? setFieldChildren(field, modifyFields(getFieldChildren(field), changedField, level + 1))
        : field;
};

export const getFieldMap = (field: IEditorFormlyField): Record<string, IEditorFormlyField> => {
    const fieldInfo = field._info;
    const fieldMap: Record<string, IEditorFormlyField> = { [fieldInfo.fieldId]: field };

    // Process children (e.g. 'fieldGroup')
    if (fieldInfo.childrenConfig) {
        const children: IEditorFormlyField | IEditorFormlyField[] = getFieldChildren(field);
        if (Array.isArray(children)) {
            return children.reduce((a, child) => ({ ...a, ...getFieldMap(child) }), fieldMap);
        } else if (children) {
            return { ...fieldMap, ...getFieldMap(children) };
        }
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

export const unsetPath = (target: object, path: string) =>
    produce(target, draft => {
        unset(draft, path);
    });
