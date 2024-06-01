import { Component } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-repeating-section-type',
    templateUrl: './repeating-section-type.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        FormlyModule,
        MatIconButton,
        MatIcon,
        MatButton,
    ],
})
export class RepeatingSectionTypeComponent extends FieldArrayType {}
