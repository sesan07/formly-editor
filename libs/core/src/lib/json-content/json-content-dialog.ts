import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { ZodType } from 'zod';
import { Tooltip } from '../shared';
import { JSONArrayValidator } from './json-array-validator';
import { JSONContent } from './json-content';
import { JSONFormatValidator } from './json-format-validator';
import { JSONSchemaValidator } from './json-schema-validator';

@Component({
  selector: 'core-json-content-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Dialog,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    JSONContent,
    FormsModule,
    JSONFormatValidator,
    JSONArrayValidator,
    JSONSchemaValidator,
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
      [header]="header()"
      [(visible)]="isOpen"
    >
      <form
        #form="ngForm"
        class="flex h-full min-h-0 flex-col"
      >
        @if (isOpen()) {
          <div
            class="grid h-20 w-full grid-cols-1 items-start gap-2 py-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            <ng-content select="[formFields]" />
          </div>
          <core-json-content
            #jsonModel="ngModel"
            class="h-[calc(100%-5rem)]"
            name="json"
            required
            coreJsonFormat
            [coreJsonArray]="isArrayRoot()"
            [coreJsonSchema]="schema()"
            [(ngModel)]="formFieldsJson"
          />
        }
      </form>
      <ng-template #footer>
        <span class="inline-flex items-center gap-2">
          <button
            pButton
            text
            aria-label="Beautify JSON"
            coreTooltip="Beautify JSON"
            tooltipPosition="top"
            [disabled]="!jsonModel()?.valid"
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
          <ng-content select="[lhsActions]" />
        </span>
        <button
          pButton
          [disabled]="!this.form().valid"
          (click)="saveForm()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            {{ saveButtonIcon() }}
          </i>
          <span pButtonLabel>{{ saveButtonLabel() }}</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class JSONContentDialog {
  readonly header = input.required<string>();
  readonly saveButtonLabel = input.required<string>();
  readonly saveButtonIcon = input.required<string>();
  readonly formFieldsJson = model.required<string>();
  readonly isOpen = model.required<boolean>();
  readonly isArrayRoot = input(false, { transform: booleanAttribute });
  readonly schema = input<ZodType<unknown>>();
  readonly form = viewChild.required(NgForm);
  readonly jsonModel = viewChild('jsonModel', { read: NgModel });

  save = output<{ name: string; json: string }>();

  inputId = `dialog-input-${Math.random().toString(36).substring(2, 15)}`;
  dialogPT: DialogPassThrough = {
    root: {
      style: { overflow: 'hidden' },
    },
    header: {
      style: { height: '5rem' },
    },
    content: {
      style: { height: 'calc(100% - 10rem)' },
    },
    footer: {
      style: { height: '5rem', alignItems: 'center', justifyContent: 'space-between' },
    },
  };

  beautify() {
    if (!this.form().valid) {
      return;
    }

    try {
      const parsed = JSON.parse(this.formFieldsJson());
      this.formFieldsJson.set(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error('Error beautifying', error);
    }
  }

  saveForm() {
    this.save.emit(this.form().value);
  }
}
