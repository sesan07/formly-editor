import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';

import { IEditorFormlyField } from '../../editor.types';
import { FormlyFieldComponent } from '../formly-field/formly-field.component';

@Component({
    selector: 'editor-formly-group',
    templateUrl: './formly-group.component.html',
    styleUrls: ['./formly-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormlyFieldComponent, FormlyModule]
})
export class FormlyGroupComponent extends FieldType<IEditorFormlyField> {}
