import { IBaseEditorFormlyField } from '../editor-service/editor.types';

export enum DragAction {
    COPY,
    MOVE
}

export interface IItemDragData {
    action: DragAction;
    field: IBaseEditorFormlyField;
}
