import { DropAction, IEditorFormlyField } from '../editor.types';

export type FieldDropPosition = 'left' | 'center' | 'right';

export interface FieldDropWidth {
    left: number;
    center?: number;
    right: number;
}

export interface IFieldDragData {
    action: DropAction;
    index: number;
    field: IEditorFormlyField;
    fieldParent?: IEditorFormlyField;
}
