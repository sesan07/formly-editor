import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DndModule } from '@ng-dnd/core';

import { FieldTreeItemComponent } from './field-tree-item.component';
import { TreeItemModule } from '../tree-item/tree-item.module';
import { FieldNameModule } from '../field-name/field-name.module';
import { FieldDropOverlayModule } from '../field-drag-drop/field-drop-overlay/field-drop-overlay.module';

@NgModule({
    declarations: [FieldTreeItemComponent],
    imports: [
        CommonModule,
        TreeItemModule,
        FieldNameModule,
        FieldDropOverlayModule,
        MatMenuModule,
        MatIconModule,
        DndModule,
    ],
    exports: [FieldTreeItemComponent],
})
export class FieldTreeItemModule {}
