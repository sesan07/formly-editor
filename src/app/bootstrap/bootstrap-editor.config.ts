import { EditorConfig } from '@sesan07/ngx-formly-editor';
import {
    checkboxTypeConfig,
    groupTypeConfig,
    inputTypeConfig,
    numberTypeConfig,
    radioTypeConfig,
    selectTypeConfig,
    textareaTypeConfig,
} from '../material/material-editor.config';

export const bootstrapEditorConfig: EditorConfig = {
    fieldOptions: [
        {
            displayName: 'Input',
            children: [inputTypeConfig, numberTypeConfig],
        },
        checkboxTypeConfig,
        radioTypeConfig,
        selectTypeConfig,
        textareaTypeConfig,
        groupTypeConfig,
    ],
    wrapperOptions: [
        {
            name: 'form-field',
        },
    ],
};
