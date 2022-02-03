import { IBaseEditorFormlyField } from "./../form-service/form.types";

export enum DragAction {
    COPY,
    MOVE
}

export interface IItemDragData {
    action: DragAction;
    field: IBaseEditorFormlyField;
}