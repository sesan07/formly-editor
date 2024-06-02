import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormlyConfig, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';
import { BehaviorSubject } from 'rxjs';

import { EditorFieldType, IEditorFormlyFieldConfigCache } from '../../editor.types';
import { RootFormlyFieldComponent } from '../formly-field/formly-field.component';
import { FormlyGroupComponent } from '../formly-group/formly-group.component';
import { FormlyFieldTemplates } from '../formly.template';

@Component({
    selector: 'editor-formly-form',
    templateUrl: './formly-form.component.html',
    styleUrls: ['./formly-form.component.scss'],
    providers: [FormlyFormBuilder, FormlyFieldTemplates],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatIcon, RootFormlyFieldComponent, AsyncPipe],
})
export class FormlyFormComponent extends FormlyForm implements OnChanges {
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
