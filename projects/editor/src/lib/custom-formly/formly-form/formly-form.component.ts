import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';
import { FormlyConfig, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';

import { FieldType, IEditorFormlyFieldConfigCache } from '../../editor.types';
import { FormlyFieldTemplates } from '../formly.template';

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

    constructor(
        builder: FormlyFormBuilder,
        config: FormlyConfig,
        ngZone: NgZone,
        fieldTemplates: FormlyFieldTemplates
    ) {
        super(builder, config, ngZone, fieldTemplates);
    }
}
