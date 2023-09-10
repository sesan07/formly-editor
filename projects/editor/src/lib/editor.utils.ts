import { TrackByFunction } from '@angular/core';
import { get, merge, set } from 'lodash-es';
import {
    FieldCategoryOption,
    FieldOption,
    FieldTypeOption,
    FieldType,
    GetDefaultField,
    IBaseFormlyField,
    IEditorFieldInfo,
    IEditorFormlyField,
} from './editor.types';

export const trackByKey: TrackByFunction<{ [others: string]: any; key: string }> = (_, val) => val.key;
export const trackByFieldId: TrackByFunction<IEditorFormlyField> = (_, field) => field._info.fieldId;

export const isCategoryOption = (x: FieldOption): x is FieldCategoryOption => !!(x as FieldCategoryOption).children;
export const isTypeOption = (x: FieldOption): x is FieldTypeOption => !!(x as FieldTypeOption).type;

export const getFormId = (counter: number): string => `form__${counter}`;
export const getFieldId = (type: string, counter: number): string => `${type}__${counter}`;
export const getFieldKey = (type: string, counter: number, defaultUnknownType: string): string =>
    `__${type ?? defaultUnknownType ?? 'generic'}_${counter}`;

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
    const fieldId = getFieldId(baseField.type, count);
    const fieldInfo: IEditorFieldInfo = {
        name: typeOption.displayName,
        formId,
        fieldId,
        parentFieldId: parent?._info.fieldId,
        fieldPath: parent ? [...parent._info.fieldPath, fieldId] : [fieldId],
        canHaveChildren: typeOption.canHaveChildren,
        childrenPath: typeOption.childrenPath,
    };

    // Create field
    const field: IEditorFormlyField = {
        ...baseField,
        _info: fieldInfo,
        key:
            baseField.key ||
            (typeOption.canHaveChildren ? undefined : getFieldKey(baseField.type, count, defaultUnknownType)),
        fieldGroup: undefined,
    };

    // Process children (e.g. 'fieldGroup')
    if (fieldInfo.canHaveChildren) {
        const baseChildren: IBaseFormlyField[] = get(baseField, fieldInfo.childrenPath);
        const children: IEditorFormlyField[] = baseChildren?.map(child =>
            convertToEditorField(getDefaultField, typeOptions, counter, formId, child, field, defaultUnknownType)
        );
        set(field, fieldInfo.childrenPath, children);
    }

    return field;
};

export const getTypeOption = (
    typeOptions: FieldTypeOption[],
    type: string,
    defaultUnknownType?: string
): FieldTypeOption => {
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
