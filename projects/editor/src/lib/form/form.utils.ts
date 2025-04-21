import { produce } from 'immer';
import { get, isEmpty, set, unset } from 'lodash-es';

import { IEditorFormlyField } from '../editor.types';

export const getFieldChildren = <T extends IEditorFormlyField>(field: T): T | T[] | undefined =>
    get(field, field._info.childrenConfig.path);

export const setFieldChildren = <T extends IEditorFormlyField>(field: T, children: T | T[]): T =>
    produce(field, draft => {
        set(draft, field._info.childrenConfig.path, children);
    });

export const cleanField = (
    field: IEditorFormlyField,
    cleanChildren = true,
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
    ['wrappers', 'templateOptions', 'props', 'expressionProperties', 'className', 'fieldGroupClassName'].forEach(p => {
        if (isEmpty(get(field, p))) {
            unset(field, p);
        }
    });
};

const _removeEditorProperties = (field: IEditorFormlyField): void => {
    delete field._info;
};
