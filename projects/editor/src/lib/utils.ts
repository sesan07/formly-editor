import { get } from 'lodash-es';

import { IEditorFormlyField } from './services/editor-service/editor.types';

export const getFieldChildren = (field: IEditorFormlyField): IEditorFormlyField[] | undefined => get(field, field.childrenPath);


export const getFormattedFieldName = (field: IEditorFormlyField): string =>
    `${field.name}${field.key ? `(${field.key})` : ''}`;
