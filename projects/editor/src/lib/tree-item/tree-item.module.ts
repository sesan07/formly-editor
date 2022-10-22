import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { TreeItemComponent } from './tree-item.component';

@NgModule({
    declarations: [TreeItemComponent],
    imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
    exports: [TreeItemComponent],
})
export class TreeItemModule {}
