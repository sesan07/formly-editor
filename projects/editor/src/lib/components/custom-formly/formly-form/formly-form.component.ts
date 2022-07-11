import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormlyFieldTemplates, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';
import { IEditorFormlyFieldConfigCache } from '../../../services/editor-service/editor.types';

@Component({
    selector: 'editor-formly-form',
    template: '<editor-root-formly-field [field]="field"></editor-root-formly-field>',
    styleUrls: ['./formly-form.component.scss'],
    providers: [FormlyFormBuilder, FormlyFieldTemplates],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyFormComponent extends FormlyForm {
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
