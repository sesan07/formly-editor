import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EditorService } from '../../../services/editor-service/editor.service';

@Component({
    selector: 'lib-form-toolbar',
    templateUrl: './form-toolbar.component.html',
    styleUrls: ['./form-toolbar.component.scss']
})
export class FormToolbarComponent {
    @Input() selectedDisplay: 'form' | 'json';
    @Output() selectedDisplayChange: EventEmitter<'form' | 'json'> = new EventEmitter();
    @Output() resetModel: EventEmitter<void> = new EventEmitter();
    @Output() toggleSidebars: EventEmitter<boolean> = new EventEmitter();

    isExpanded = true;

    constructor(public editorService: EditorService) {}
}
