import { Component, HostBinding, Input } from '@angular/core';
import { FieldDropPosition, FieldDropWidth } from '../field-drag-drop.types';

@Component({
    selector: 'editor-field-drop-overlay',
    templateUrl: './field-drop-overlay.component.html',
    styleUrls: ['./field-drop-overlay.component.scss'],
})
export class FieldDropOverlayComponent {
    @Input() @HostBinding('class.hovering') isHovering: boolean;
    @Input() hoverPosition: FieldDropPosition;
    @Input() dropWidth: FieldDropWidth;
}
