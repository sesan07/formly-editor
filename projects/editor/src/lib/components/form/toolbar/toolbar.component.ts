import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EditorService } from '../../../services/editor-service/editor.service';

@Component({
    selector: 'editor-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {
    @Input() selectedDisplay: 'form' | 'json';
    @Input() isEditMode: boolean;

    @Output() selectedDisplayChange: EventEmitter<'form' | 'json'> = new EventEmitter();
    @Output() isEditModeChange: EventEmitter<boolean> = new EventEmitter();
    @Output() duplicateForm: EventEmitter<void> = new EventEmitter();
    @Output() resetModel: EventEmitter<void> = new EventEmitter();
    @Output() toggleSidebars: EventEmitter<boolean> = new EventEmitter();

    isExpanded = true;

    constructor(public editorService: EditorService) {}
}
