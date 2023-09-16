import { cloneDeep, get, isEmpty, set } from 'lodash-es';

import { IEditorFormlyField } from '../editor.types';

export const getFieldChildren = (field: IEditorFormlyField): IEditorFormlyField | IEditorFormlyField[] | undefined =>
    get(field, field._info.childrenConfig.path);

export const setFieldChildren = (
    field: IEditorFormlyField,
    children: IEditorFormlyField | IEditorFormlyField[]
): IEditorFormlyField => set(cloneDeep(field), field._info.childrenConfig.path, children);

export const cleanField = (
    field: IEditorFormlyField,
    cleanChildren: boolean = true,
    removeEditorProperties?: boolean
): void => {
    if (cleanChildren && field._info.childrenConfig) {
        const children: IEditorFormlyField | IEditorFormlyField[] = getFieldChildren(field);
        if (Array.isArray(children)) {
            children.forEach(child => {
                cleanField(child, cleanChildren, removeEditorProperties);
            });
        } else if (children) {
            cleanField(children, cleanChildren, removeEditorProperties);
        }
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
};
