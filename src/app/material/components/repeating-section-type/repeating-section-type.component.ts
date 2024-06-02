import { Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';

@Component({
    selector: 'app-repeating-section-type',
    templateUrl: './repeating-section-type.component.html',
    standalone: true,
    imports: [FormlyModule, MatIconButton, MatIcon, MatButton],
})
export class RepeatingSectionTypeComponent extends FieldArrayType {}
