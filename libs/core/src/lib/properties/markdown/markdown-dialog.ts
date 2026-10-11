import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { MarkdownDialogService } from './markdown-dialog.service';
import { CodeEditor } from '../../shared/code-editor';

@Component({
  selector: 'core-markdown-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, ButtonLabel, CodeEditor, Dialog],
  template: `
    <p-dialog
      header="Edit Markdown"
      modal
      [style]="{
        width: '800px',
        maxWidth: 'calc(100vw - 32px)',
        height: '600px',
        maxHeight: 'calc(100vh - 32px)',
      }"
      [pt]="dialogPT"
      [visible]="isOpen()"
      (visibleChange)="updateVisibility($event)"
    >
      @if (isOpen() && data()) {
        <core-code-editor
          mode="markdown"
          placeholderText="Write Markdown content..."
          [text]="data()?.value || ''"
          (textChange)="setValue($event)"
        />
      }
      <ng-template #footer>
        <button
          pButton
          text
          type="button"
          (click)="cancel()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            >close</i
          >
          <span pButtonLabel>Cancel</span>
        </button>
        <button
          pButton
          type="button"
          (click)="save()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            >save</i
          >
          <span pButtonLabel>Save</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class MarkdownDialog {
  readonly codeEditor = viewChild(CodeEditor);
  private readonly dialogService = inject(MarkdownDialogService);

  readonly isOpen = this.dialogService.isOpen;
  readonly data = this.dialogService.data;
  readonly dialogPT: DialogPassThrough = {
    root: {
      style: { overflow: 'hidden' },
    },
    content: {
      style: { height: 'calc(100% - 10rem)', overflow: 'hidden' },
    },
    footer: {
      style: { height: '5rem', alignItems: 'center', justifyContent: 'flex-end' },
    },
  };

  setValue(value: string): void {
    this.dialogService.setValue(value);
  }

  save(): void {
    const data = this.data();
    if (data) {
      data.saveCallback(data.value);
    }
    this.dialogService.close();
  }

  cancel(): void {
    this.dialogService.close();
  }

  updateVisibility(visible: boolean): void {
    if (!visible) {
      this.cancel();
    }
  }
}
