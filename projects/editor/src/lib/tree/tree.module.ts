import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { TreeItemHeaderComponent } from './tree-item-header/tree-item-header.component';

@NgModule({
    declarations: [TreeItemHeaderComponent],
    imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
    exports: [TreeItemHeaderComponent],
})
export class TreeModule {}
