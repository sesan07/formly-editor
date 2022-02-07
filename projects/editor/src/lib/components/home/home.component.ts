import { Component, HostListener, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { EditorService } from '../../services/editor-service/editor.service';
import { MouseService } from '../../services/mouse-service/mouse.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

	@ViewChild(MatTabGroup) tabGroup: MatTabGroup;

    constructor(public editorService: EditorService, private _mouseService: MouseService) {}

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this._mouseService.position.x = event.clientX;
        this._mouseService.position.y = event.clientY;
    }

    onImportForm(): void {
        this.editorService.importForm();
    }

    onExportForm(): void {
        this.editorService.exportForm(this.tabGroup.selectedIndex);
    }

}
