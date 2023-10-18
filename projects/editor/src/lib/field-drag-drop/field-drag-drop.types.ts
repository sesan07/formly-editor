import { DropAction, IEditorFormlyField } from '../editor.types';

export type FieldDropPosition = 'left' | 'center' | 'right';

export interface IFieldDragData {
    action: DropAction;
    index: number;
    field: IEditorFormlyField;
    fieldParent?: IEditorFormlyField;
}
