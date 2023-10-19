import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DndModule } from '@ng-dnd/core';

import { FieldDropOverlayModule } from '../field-drag-drop/field-drop-overlay/field-drop-overlay.module';
import { FieldNameModule } from '../field-name/field-name.module';
import { TreeItemModule } from '../tree-item/tree-item.module';
import { AddFieldTreeItemComponent } from './add-field-tree-item.component';

@NgModule({
    declarations: [AddFieldTreeItemComponent],
    imports: [CommonModule, TreeItemModule, FieldNameModule, FieldDropOverlayModule, DndModule],
    exports: [AddFieldTreeItemComponent],
})
export class AddFieldTreeItemModule {}
