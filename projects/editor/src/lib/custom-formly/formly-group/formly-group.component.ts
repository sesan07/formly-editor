import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { IEditorFormlyField } from '../../editor.types';

@Component({
    selector: 'editor-formly-group',
    templateUrl: './formly-group.component.html',
    styleUrls: ['./formly-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyGroupComponent extends FieldType<IEditorFormlyField> {}
