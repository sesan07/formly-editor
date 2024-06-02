import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
    selector: 'app-card-wrapper',
    templateUrl: './card-wrapper.component.html',
    standalone: true,
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent],
})
export class CardWrapperComponent extends FieldWrapper {}
