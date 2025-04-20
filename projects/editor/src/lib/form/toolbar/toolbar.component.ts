import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';

import { EditorService } from '../../editor.service';

@Component({
    selector: 'editor-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonToggleGroup,
        MatButtonToggle,
        MatIcon,
        MatSlideToggle,
        ReactiveFormsModule,
        FormsModule,
        MatIconButton,
    ]
})
export class ToolbarComponent {
    @Input() tabIndex: 0 | 1;
    @Input() isEditMode: boolean;

    @Output() tabIndexChange: EventEmitter<0 | 1> = new EventEmitter();
    @Output() isEditModeChange: EventEmitter<boolean> = new EventEmitter();
    @Output() resetModel: EventEmitter<void> = new EventEmitter();
    @Output() duplicateForm: EventEmitter<void> = new EventEmitter();
    @Output() exportForm: EventEmitter<void> = new EventEmitter();
    @Output() toggleSidebars: EventEmitter<boolean> = new EventEmitter();

    isExpanded = true;

    constructor(public editorService: EditorService) {}
}
