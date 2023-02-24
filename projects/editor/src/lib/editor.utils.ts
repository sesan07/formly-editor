import { TrackByFunction } from '@angular/core';
import { get, merge, set } from 'lodash-es';
import {
    EditorTypeOption,
    FieldType,
    GetDefaultField,
    IBaseFormlyField,
    IEditorFieldInfo,
    IEditorFormlyField,
} from './editor.types';

export const trackByKey: TrackByFunction<{ [others: string]: any; key: string }> = (_, val) => val.key;
export const trackByFieldId: TrackByFunction<IEditorFormlyField> = (_, field) => field._info.fieldId;

export const getFormId = (counter: number): string => `form__${counter}`;
export const getFieldId = (type: string, counter: number): string => `${type}__${counter}`;
export const getFieldKey = (type: string, counter: number): string => `__${type}_${counter}`;

export const convertToEditorField = (
    getDefaultField: GetDefaultField,
    typeOptions: EditorTypeOption[],
    counter: { count: number },
    formId: string,
    sourceField: IBaseFormlyField,
    parent?: IEditorFormlyField,
    unknownTypeName?: string
) => {
    // Special case to specify 'formly-group' type
    if (!sourceField.type && sourceField.fieldGroup) {
        sourceField.type = FieldType.FORMLY_GROUP;
    }

    // Merge with default properties
    const baseField: IBaseFormlyField = getDefaultField(sourceField.type, sourceField.customType, sourceField);
    merge(baseField, sourceField);

    // Editor information
    const typeOption: EditorTypeOption = getTypeOption(
        typeOptions,
        baseField.type,
        baseField.customType,
        unknownTypeName
    );
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
        key: baseField.key || (typeOption.canHaveChildren ? undefined : getFieldKey(baseField.type, count)),
        fieldGroup: undefined,
    };

    // Process children (e.g. 'fieldGroup')
    if (fieldInfo.canHaveChildren) {
        const baseChildren: IBaseFormlyField[] = get(baseField, fieldInfo.childrenPath);
        const children: IEditorFormlyField[] = baseChildren?.map(child =>
            convertToEditorField(getDefaultField, typeOptions, counter, formId, child, field, unknownTypeName)
        );
        set(field, fieldInfo.childrenPath, children);
    }

    return field;
};

export const getTypeOption = (
    typeOptions: EditorTypeOption[],
    type: string,
    customType?: string,
    unknownTypeName?: string
): EditorTypeOption => {
    let typeOption: EditorTypeOption = typeOptions.find(
        option => option.name === type && option.customName === customType
    );

    if (!typeOption && unknownTypeName) {
        typeOption = typeOptions.find(option => option.name === unknownTypeName);
    }

    if (!typeOption) {
        console.warn('EditorTypeOption not configured for type: ' + type);
        typeOption = { name: undefined, displayName: 'Unknown Type' };
    }

    return typeOption;
};
