import { Component, HostListener, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { EditorWrapperService } from '../../services/editor-wrapper-service/editor-wrapper.service';
import { FormService } from '../../services/form-service/form.service';
import { MouseService } from '../../services/mouse-service/mouse.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

	@ViewChild(MatTabGroup) tabNav: MatTabGroup;

    constructor(public formService: FormService, public wrapperService: EditorWrapperService, private _mouseService: MouseService) {
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this._mouseService.position.x = event.clientX;
        this._mouseService.position.y = event.clientY;
    }

    onImportForm(): void {
        this.formService.importForm();
    }

    onExportForm(): void {
        this.formService.exportForm(this.tabNav.selectedIndex);
    }

}
