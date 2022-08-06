import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
    selector: 'app-card-wrapper',
    templateUrl: './card-wrapper.component.html',
    styleUrls: ['./card-wrapper.component.scss'],
})
export class CardWrapperComponent extends FieldWrapper {}
