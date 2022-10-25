import { get, isEmpty } from 'lodash-es';

import { EditorTypeCategoryOption, EditorTypeOption, IEditorFormlyField } from '../editor.types';

export const getFieldChildren = (field: IEditorFormlyField): IEditorFormlyField[] | undefined =>
    get(field, field._info.childrenPath);

export const cleanField = (
    field: IEditorFormlyField,
    cleanChildren: boolean = true,
    removeEditorProperties?: boolean
): void => {
    if (cleanChildren && field._info.canHaveChildren) {
        getFieldChildren(field).forEach(child => {
            cleanField(child, cleanChildren, removeEditorProperties);
        });
    }

    if (removeEditorProperties) {
        _removeEditorProperties(field);
        _removeEmptyProperties(field);
    }
};

export const getReplaceCategories = (
    categories: EditorTypeCategoryOption[],
    type: string,
    customType?: string
): EditorTypeCategoryOption[] =>
    categories
        .map(category => {
            // Filter fields that can have children and aren't this field
            const options: EditorTypeOption[] = category.typeOptions.filter(option => {
                if (!option.canHaveChildren) {
                    return false;
                }

                // If they're the same type, return based on customType
                if (option.name === type) {
                    return option.customName !== customType;
                }
                return true;
            });

            return { ...category, typeOptions: options };
        })
        .filter(category => category.typeOptions.length > 0); // Remove categories with empty fields

const _removeEmptyProperties = (field: IEditorFormlyField): void => {
    if (isEmpty(field.wrappers)) {
        delete field.wrappers;
    }
    if (isEmpty(field.templateOptions)) {
        delete field.templateOptions;
    }
    if (isEmpty(field.expressionProperties)) {
        delete field.expressionProperties;
    }
};

const _removeEditorProperties = (field: IEditorFormlyField): void => {
    delete field._info;
    delete field.customType;
};
