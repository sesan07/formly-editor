import { IEditorFormlyField } from '../editor.types';

export enum DragAction {
    COPY,
    MOVE
}

export interface IItemDragData {
    action: DragAction;
    field: IEditorFormlyField;
}
