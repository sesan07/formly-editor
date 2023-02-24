import { IForm } from '../editor.types';

export interface IEditorState {
    formMap: Readonly<Record<string, IForm>>;
    activeFormId: Readonly<string | null>;
    formIdCounter: Readonly<number>;
}
