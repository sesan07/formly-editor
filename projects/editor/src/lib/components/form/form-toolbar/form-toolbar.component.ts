import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'lib-form-toolbar',
    templateUrl: './form-toolbar.component.html',
    styleUrls: ['./form-toolbar.component.scss']
})
export class FormToolbarComponent {
    @Input() selectedDisplay: 'form' | 'json';
    @Output() selectedDisplayChange: EventEmitter<'form' | 'json'> = new EventEmitter();
}
