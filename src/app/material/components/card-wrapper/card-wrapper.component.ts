import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { NgIf } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';

@Component({
    selector: 'app-card-wrapper',
    templateUrl: './card-wrapper.component.html',
    standalone: true,
    imports: [MatCard, MatCardHeader, NgIf, MatCardTitle, MatCardContent],
})
export class CardWrapperComponent extends FieldWrapper {}
