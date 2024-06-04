import { InjectionToken } from '@angular/core';

import { IForm } from '../editor.types';
import { createEditorFeature } from './state.reducers';

export interface IEditorState {
    formMap: Readonly<Record<string, IForm>>;
    activeFormId: Readonly<string | null>;
}

export type EditorFeature = ReturnType<typeof createEditorFeature>;
export const EDITOR_FEATURE = new InjectionToken<EditorFeature>('EDITOR_FEATURE');
