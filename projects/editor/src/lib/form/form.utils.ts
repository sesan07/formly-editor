import { get, isEmpty, set } from 'lodash-es';

import { IEditorFormlyField } from '../editor.types';

export const getFieldChildren = (field: IEditorFormlyField): IEditorFormlyField[] | undefined =>
    get(field, field._info.childrenPath);

export const setFieldChildren = (field: IEditorFormlyField, children: IEditorFormlyField[]): IEditorFormlyField =>
    set(field, field._info.childrenPath, children);

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
