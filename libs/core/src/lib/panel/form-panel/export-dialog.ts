import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import saveAs from 'file-saver';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { CoreFormService } from '../../editor/core-form.service';
import { ExportDialogService } from './export-dialog.service';
import { JSONContentDialog } from '../../json-content/json-content-dialog';

@Component({
  selector: 'core-export-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JSONContentDialog, FormsModule, FloatLabel, InputText, Message],
  template: `
    <core-json-content-dialog
      header="Export Form"
      saveButtonLabel="Export Form"
      saveButtonIcon="download"
      [isArrayRoot]="true"
      [isOpen]="isOpen()"
      [(formFieldsJson)]="formFieldsJSON"
      (isOpenChange)="updateVisibility($event)"
      (save)="exportForm()"
    >
      <ng-container formFields>
        <div>
          <p-floatlabel variant="on">
            <input
              #nameModel="ngModel"
              class="w-full"
              name="name"
              pInputText
              required
              autocomplete="off"
              data-bwignore
              id="export-dialog-name-input"
              [(ngModel)]="formName"
            />
            <label for="export-dialog-name-input">Name</label>
          </p-floatlabel>
          @if (!nameModel.valid && nameModel.touched) {
            <p-message
              class="mt-1 inline-block"
              severity="error"
              size="small"
              variant="simple"
              >Name is required.</p-message
            >
          }
        </div>
      </ng-container>
    </core-json-content-dialog>
  `,
})
export class ExportDialog {
  protected dialogService = inject(ExportDialogService);
  protected formService = inject(CoreFormService);

  isOpen = this.dialogService.isOpen;

  readonly formName = signal('');
  readonly formFieldsJSON = signal('');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.formName.set(this.formService.activeForm()?.name ?? 'Form');
        this.formFieldsJSON.set(this.formService.activeFormFieldsJSON());
      }
    });
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }

  exportForm() {
    try {
      const blob: Blob = new Blob([this.formFieldsJSON()], { type: 'application/json' });
      saveAs(blob, this.formName());
      this.dialogService.close();
    } catch {
      return;
    }
  }
}
