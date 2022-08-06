import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SidebarSectionComponent } from './sidebar-section/sidebar-section.component';
import { SidebarComponent } from './sidebar.component';

@NgModule({
    declarations: [SidebarComponent, SidebarSectionComponent],
    imports: [CommonModule, MatIconModule, MatButtonModule],
    exports: [SidebarComponent, SidebarSectionComponent],
})
export class SidebarModule {}
