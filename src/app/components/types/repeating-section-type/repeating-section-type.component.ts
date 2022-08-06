import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
    selector: 'app-repeating-section-type',
    templateUrl: './repeating-section-type.component.html',
    styleUrls: ['./repeating-section-type.component.scss'],
})
export class RepeatingSectionTypeComponent extends FieldArrayType {}
