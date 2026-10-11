import { CoreFormService } from '../../editor/core-form.service';
import { ChangeDetectionStrategy, Component, effect, inject, viewChild } from '@angular/core';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { PreviewDialogService } from './preview-dialog.service';
import { FormPreviewContent } from './form-preview-content';

@Component({
  selector: 'core-form-preview-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, FormPreviewContent],
  template: `
    <p-dialog
      header="Form Preview"
      maximizable
      [pt]="pt"
      [visible]="isOpen()"
      (visibleChange)="updateVisibility($event)"
    >
      @if (isOpen()) {
        <core-form-preview-content [formFields]="activePreviewFormFields()" />
      }
    </p-dialog>
  `,
})
export class FormPreviewDialog {
  readonly dialogRef = viewChild(Dialog);

  dialogService = inject(PreviewDialogService);
  protected formService = inject(CoreFormService);

  isOpen = this.dialogService.isOpen;
  activePreviewFormFields = this.formService.activePreviewFormFields;

  pt: DialogPassThrough = {
    pcMaximizeButton: {
      host: {
        style: { display: 'none' },
      },
    },
  };
  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.dialogRef()?.maximize();
      }
    });
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }
}
