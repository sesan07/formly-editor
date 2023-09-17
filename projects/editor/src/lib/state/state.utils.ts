import { get, merge, set, unset } from 'lodash-es';
import {
    FieldType,
    FieldTypeOption,
    GetDefaultField,
    IBaseFormlyField,
    IEditorFieldInfo,
    IEditorFormlyField,
} from '../editor.types';
import { setFieldChildren, getFieldChildren } from '../form/form.utils';
import produce from 'immer';
import { IPropertyChange } from '../property/property.types';

import { nanoid } from 'nanoid';

export const generateFormId = (counter: number): string => `form__${nanoid()}`;
const generateFieldId = (type: string, counter: number): string => `${type}__${nanoid()}`;
const generateFieldKey = (type: string, counter: number, defaultUnknownType: string): string =>
    `__${type ?? defaultUnknownType ?? 'generic'}_${nanoid(5)}`;

export const convertToEditorField = (
    getDefaultField: GetDefaultField,
    typeOptions: FieldTypeOption[],
    counter: { count: number },
    formId: string,
    sourceField: IBaseFormlyField,
    parent?: IEditorFormlyField,
    defaultUnknownType?: string
) => {
    // Special case to specify 'formly-group' type
    if (!sourceField.type && sourceField.fieldGroup) {
        sourceField.type = FieldType.FORMLY_GROUP;
    }

    // Merge with default properties
    const typeOption: FieldTypeOption = getTypeOption(typeOptions, sourceField.type, defaultUnknownType);
    const baseField: IBaseFormlyField = getDefaultField(sourceField.type);
    merge(baseField, sourceField);

    // Editor information
    const count = counter.count++;
    const fieldId = generateFieldId(baseField.type, count);
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
            (typeOption.disableKeyGeneration ? undefined : generateFieldKey(baseField.type, count, defaultUnknownType)),
        fieldGroup: undefined,
    };

    // Process children (e.g. 'fieldGroup')
    if (fieldInfo.childrenConfig) {
        const baseChildren: IBaseFormlyField | IBaseFormlyField[] = get(baseField, fieldInfo.childrenConfig.path);
        let children: IEditorFormlyField | IEditorFormlyField[];
        if (Array.isArray(baseChildren)) {
            children = baseChildren?.map(child =>
                convertToEditorField(getDefaultField, typeOptions, counter, formId, child, field, defaultUnknownType)
            );
        } else {
            children = convertToEditorField(
                getDefaultField,
                typeOptions,
                counter,
                formId,
                baseChildren,
                field,
                defaultUnknownType
            );
        }
        set(field, fieldInfo.childrenConfig.path, children);
    }

    return field;
};

const getTypeOption = (typeOptions: FieldTypeOption[], type: string, defaultUnknownType?: string): FieldTypeOption => {
    let typeOption: FieldTypeOption = typeOptions.find(option => option.type === type);

    if (!typeOption && defaultUnknownType) {
        typeOption = typeOptions.find(option => option.type === defaultUnknownType);
    }

    if (!typeOption) {
        console.warn('EditorTypeOption not configured for type: ' + type);
        typeOption = { type: undefined, displayName: 'Unknown Type' };
    }

    return typeOption;
};

export const duplicateFields = (
    fields: IEditorFormlyField | IEditorFormlyField[],
    formId: string,
    parentFieldId?: string,
    counter = { count: 0 }
) =>
    Array.isArray(fields)
        ? fields.map(field => duplicateFieldObject(field, formId, parentFieldId, counter))
        : duplicateFieldObject(fields, formId, parentFieldId, counter);

const duplicateFieldObject = (
    field: IEditorFormlyField,
    formId: string,
    parentFieldId?: string,
    counter = { count: 0 }
) => {
    const fieldId = generateFieldId(field.type, counter.count++);
    return {
        ...field,
        _info: {
            ...field._info,
            parentFieldId,
            formId,
            fieldId,
        },
        ...(field._info.childrenConfig
            ? set(
                  {},
                  field._info.childrenConfig.path,
                  duplicateFields(getFieldChildren(field), formId, fieldId, counter)
              )
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
