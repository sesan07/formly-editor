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
    ],
})
export class ToolbarComponent {
    @Input() tabIndex: 0 | 1;
    @Input() isEditMode: boolean;

    @Output() tabIndexChange = new EventEmitter<0 | 1>();
    @Output() isEditModeChange = new EventEmitter<boolean>();
    @Output() resetModel = new EventEmitter<void>();
    @Output() duplicateForm = new EventEmitter<void>();
    @Output() exportForm = new EventEmitter<void>();
    @Output() toggleSidebars = new EventEmitter<boolean>();

    isExpanded = true;

    constructor(public editorService: EditorService) {}
}
