import { ChangeDetectionStrategy, Component, NgZone, SimpleChanges } from '@angular/core';
import { FormlyConfig, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';
import { BehaviorSubject } from 'rxjs';

import { EditorFieldType, IEditorFormlyFieldConfigCache } from '../../editor.types';
import { FormlyFieldTemplates } from '../formly.template';
import { RootFormlyFieldComponent } from '../formly-field/formly-field.component';
import { MatIcon } from '@angular/material/icon';
import { NgIf, AsyncPipe } from '@angular/common';
import { FormlyGroupComponent } from '../formly-group/formly-group.component';

@Component({
    selector: 'editor-formly-form',
    templateUrl: './formly-form.component.html',
    styleUrls: ['./formly-form.component.scss'],
    providers: [FormlyFormBuilder, FormlyFieldTemplates],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatIcon, RootFormlyFieldComponent, AsyncPipe],
})
export class FormlyFormComponent extends FormlyForm {
    public override field: IEditorFormlyFieldConfigCache = {
        _info: {
            name: undefined,
            formId: undefined,
            fieldId: undefined,
            fieldPath: undefined,
        },
        type: EditorFieldType.FORMLY_GROUP,
    };

    public formError$: BehaviorSubject<string> = new BehaviorSubject('');

    constructor(
        builder: FormlyFormBuilder,
        config: FormlyConfig,
        ngZone: NgZone,
        fieldTemplates: FormlyFieldTemplates
    ) {
        super(builder, config, ngZone, fieldTemplates);

        // Use the editor's formly-group component
        config.setType({
            name: EditorFieldType.FORMLY_GROUP,
            component: FormlyGroupComponent,
        });
    }

    override ngOnChanges(changes: SimpleChanges): void {
        try {
            super.ngOnChanges(changes);
            this.formError$.next('');
        } catch (e) {
            this.field.fieldGroup = [];
            this.formError$.next(`Build Error: ${e.message}`);
            console.error(e);
        }
    }
}
