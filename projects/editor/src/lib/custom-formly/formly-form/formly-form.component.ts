import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormlyFieldTemplates, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';

import { FieldType, IEditorFormlyFieldConfigCache } from '../../editor.types';

@Component({
    selector: 'editor-formly-form',
    template: '<editor-root-formly-field [field]="field"></editor-root-formly-field>',
    styleUrls: ['./formly-form.component.scss'],
    providers: [FormlyFormBuilder, FormlyFieldTemplates],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyFormComponent extends FormlyForm {
    override field: IEditorFormlyFieldConfigCache = {
        _info: {
            name: undefined,
            formId: undefined,
            fieldId: undefined,
            fieldPath: undefined,
        },
        type: FieldType.FORMLY_GROUP,
    };
}
