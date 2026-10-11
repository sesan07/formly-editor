import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoFocus } from 'primeng/autofocus';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { Inplace, InplacePassThrough } from 'primeng/inplace';
import { InputText } from 'primeng/inputtext';
import { ExpressionDialogService } from './expression-dialog.service';
import { CodeEditor } from '../../shared/code-editor';
import { beautifyCode, flattenToOneLine } from '../../shared/code-editor-utils';
import { Tooltip } from '../../shared/tooltip';

@Component({
  selector: 'core-expression-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Dialog,
    CodeEditor,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    InputText,
    Inplace,
    AutoFocus,
    FormsModule,
    Tooltip,
  ],
  template: `
    <p-dialog
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
      <ng-template #header>
        <div class="inline-flex items-center justify-center gap-2 text-xl font-semibold">
          <span>Edit expression:</span>
          <p-inplace [pt]="inplacePT">
            <ng-template #display>
              <span class="inline-flex items-center gap-2">
                <span class="ml-2">{{ data()?.key || '<- target ->' }}</span>
                <i class="material-symbols-outlined"> edit </i>
              </span>
            </ng-template>
            <ng-template
              #content
              let-closeCallback="closeCallback"
            >
              <span class="inline-flex gap-2">
                <input
                  #nameInput="ngModel"
                  type="text"
                  placeholder="e.g., model.myKey"
                  pInputText
                  [pAutoFocus]="true"
                  [ngModel]="data()?.key || ''"
                  (keydown.enter)="setKey(nameInput.value, closeCallback)"
                />
                <button
                  pButton
                  text
                  rounded
                  aria-label="Confirm target"
                  coreTooltip="Confirm target"
                  tooltipPosition="top"
                  [showDelay]="500"
                  (click)="setKey(nameInput.value, closeCallback)"
                >
                  <i
                    pButtonIcon
                    class="material-symbols-outlined"
                  >
                    check
                  </i>
                </button>
                <button
                  pButton
                  text
                  rounded
                  severity="danger"
                  aria-label="Cancel target edit"
                  coreTooltip="Cancel target edit"
                  tooltipPosition="top"
                  [showDelay]="500"
                  (click)="closeCallback($event)"
                >
                  <i
                    pButtonIcon
                    class="material-symbols-outlined"
                  >
                    close
                  </i>
                </button>
              </span>
            </ng-template>
          </p-inplace>
        </div>
      </ng-template>

      @if (isOpen() && data()) {
        <core-code-editor
          [text]="data()?.value || ''"
          [placeholderText]="placeholder"
        />
      }
      <ng-template #footer>
        <span class="inline-flex items-center gap-2">
          <button
            pButton
            text
            aria-label="Format expression as single line"
            coreTooltip="Single Line"
            tooltipPosition="top"
            (click)="flattenToLine()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              remove
            </i>
            <span
              class="hidden sm:inline"
              pButtonLabel
              >Single Line</span
            >
          </button>
          <button
            pButton
            text
            aria-label="Beautify expression"
            coreTooltip="Beautify expression"
            tooltipPosition="top"
            (click)="beautify()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              wand_stars
            </i>
            <span
              class="hidden sm:inline"
              pButtonLabel
              >Beautify</span
            >
          </button>
          <button
            pButton
            text
            aria-label="Add function block"
            coreTooltip="Add function block"
            tooltipPosition="top"
            (click)="addFunctionBlock()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              code
            </i>
            <span
              class="hidden sm:inline"
              pButtonLabel
              >Add Function Block</span
            >
          </button>
        </span>
        <button
          pButton
          (click)="save()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            save
          </i>
          <span pButtonLabel>Save</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class ExpressionDialog {
  readonly codeEditor = viewChild(CodeEditor);

  dialogService = inject(ExpressionDialogService);

  isOpen = this.dialogService.isOpen;
  data = this.dialogService.data;
  dialogPT: DialogPassThrough = {
    root: {
      style: { overflow: 'hidden' },
    },
    header: {
      style: { height: '5rem' },
    },
    content: {
      style: { height: 'calc(100% - 10rem)', overflow: 'hidden' },
    },
    footer: {
      style: { height: '5rem', alignItems: 'center', justifyContent: 'space-between' },
    },
  };
  inplacePT: InplacePassThrough = {
    display: {
      ariaLabel: 'Edit expression target',
    },
  };
  placeholder = `// Set the target using a javascript expression.

// Available variables:
// model: The current model object
// formState: The current form state
// field: The current field configuration

// Example:
// model.age >= 18; // sets the target to true if age is 18 or older

// You can also use a self executing function for a multi-line expression:
(() => {
  console.log('Evaluating expression with', model);
  const age = model.age || 0;
  return age >= 18;
})();
  `;

  setKey(newKey: string, inplaceCloseCallback: () => void) {
    this.dialogService.setKey(newKey);
    inplaceCloseCallback();
  }

  beautify() {
    this.dialogService.setValue(beautifyCode(this.getEditorValue()));
  }

  async flattenToLine() {
    this.dialogService.setValue(await flattenToOneLine(this.getEditorValue()));
  }

  addFunctionBlock() {
    const block = `(() => {
  const bar = 'World';
  return 'Hello ' + (model?.foo || bar);
})()`;
    this.dialogService.setValue(this.getEditorValue() + block);
  }

  save() {
    const key = this.data()?.key || '';
    const value = this.getEditorValue();
    this.data()?.saveCallback(key, value);
    this.dialogService.close();
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }

  protected getEditorValue(): string {
    return this.codeEditor()?.getValue() || '';
  }
}
