import { get } from 'lodash-es';
import { IEditorFormlyField } from './services/editor-service/editor.types';

export const getChildren = (field: IEditorFormlyField): IEditorFormlyField[] | undefined => get(field, field.childrenPath);
