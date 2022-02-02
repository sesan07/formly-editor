import { Component, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { EditorWrapperService } from '../../services/editor-wrapper-service/editor-wrapper.service';
import { FormService } from '../../services/form-service/form.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

	@ViewChild(MatTabGroup) tabNav: MatTabGroup;

    constructor(public formService: FormService, public wrapperService: EditorWrapperService) {
    }

    onImportForm(): void {
        this.formService.importForm();
    }

    onExportForm(): void {
        this.formService.exportForm(this.tabNav.selectedIndex);
    }

}
