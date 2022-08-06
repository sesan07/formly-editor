import { get, isEmpty } from 'lodash-es';

import { IEditorFormlyField } from '../editor.types';

export const getFieldChildren = (field: IEditorFormlyField): IEditorFormlyField[] | undefined =>
    get(field, field.childrenPath);

export const getFormattedFieldName = (field: IEditorFormlyField): string =>
    `${field.name}${field.key ? `(${field.key})` : ''}`;

export const cleanField = (
    field: IEditorFormlyField,
    cleanChildren: boolean = true,
    removeEditorProperties?: boolean
): void => {
    delete field.properties;

    if (cleanChildren && field.canHaveChildren) {
        getFieldChildren(field).forEach(child => {
            cleanField(child, cleanChildren, removeEditorProperties);
        });
    }

    if (removeEditorProperties) {
        _removeEditorProperties(field);
        _removeEmptyProperties(field);
    }
};

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
    delete field.name;
    delete field.formId;
    delete field.fieldId;
    delete field.parentFieldId;
    delete field.properties;
    delete field.canHaveChildren;
    delete field.childrenPath;
    delete field.customType;
};
