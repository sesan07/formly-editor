import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormlyFieldTemplates, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';
import { IEditorFormlyFieldConfigCache } from '../../../services/editor-service/editor.types';

@Component({
    selector: 'lib-editor-formly-form',
    template: '<lib-editor-root-formly-field [field]="field"></lib-editor-root-formly-field>',
    styleUrls: ['./editor-formly-form.component.scss'],
    providers: [FormlyFormBuilder, FormlyFieldTemplates],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFormlyFormComponent extends FormlyForm {
    field: IEditorFormlyFieldConfigCache = {
        type: 'formly-group',
        name: undefined,
        properties: undefined,
        formId: undefined,
        fieldId: undefined,
        templateOptions: undefined,
        wrappers: undefined,
        expressionProperties: undefined,
     };
}
