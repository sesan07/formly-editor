import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { CreateFormDialogService } from '../panel/forms-panel/create-form-dialog.service';
import { PanelService } from '../editor/panel.service';
import { Empty } from './empty';

@Component({
  selector: 'core-empty-no-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Empty, ButtonDirective],
  template: `
    <core-empty
      label="No Active form"
      description="Select a form from the Workspace panel, or create a new one to get started"
    >
      <span class="inline-flex flex-wrap items-center justify-center gap-4">
        <button
          pButton
          severity="secondary"
          (click)="openFormsPanel()"
        >
          <i class="material-symbols-outlined">open_in_new</i>
          Open Workspace Panel
        </button>
        <button
          pButton
          (click)="addNewForm()"
        >
          <i class="material-symbols-outlined">add</i>
          Create Form
        </button>
      </span>
    </core-empty>
  `,
})
export class EmptyNoForm {
  protected panelService = inject(PanelService);
  protected createFormDialogService = inject(CreateFormDialogService);

  openFormsPanel() {
    this.panelService.setActiveLHSPanel('forms');
  }

  addNewForm(): void {
    this.createFormDialogService.open();
  }
}
