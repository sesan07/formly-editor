import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Textarea } from 'primeng/textarea';
import { ExpressionDialogService } from './expression-dialog.service';
import { beautifyCode, flattenToOneLine } from '../../shared/code-editor-utils';
import { Tooltip } from '../../shared/tooltip';
import { FieldPropertyWrapper } from '../property-wrapper';
import { Expression } from './expressions.types';

@Component({
  selector: 'core-expression-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    Panel,
    InputText,
    Textarea,
    FormsModule,
    Tooltip,
    FieldPropertyWrapper,
  ],
  template: `
    <p-panel [header]="'Expression ' + (index() + 1)">
      <ng-template #icons>
        <span class="inline-flex items-center gap-2">
          @if (dialogService) {
            <button
              pButton
              text
              rounded
              aria-label="Open expression editor"
              coreTooltip="Open expression editor"
              tooltipPosition="left"
              (click)="openEditor()"
            >
              <i
                pButtonIcon
                class="material-symbols-outlined"
                >code_blocks</i
              >
            </button>
          }
          <button
            pButton
            text
            rounded
            severity="danger"
            aria-label="Remove expression"
            coreTooltip="Remove expression"
            tooltipPosition="top"
            (click)="remove.emit()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
              >remove</i
            >
          </button>
        </span>
      </ng-template>

      <div class="flex flex-col gap-1">
        <core-field-property-wrapper
          label="Target"
          description="Target model path (e.g. model.myKey)"
          [labelForId]="keyInputId"
        >
          <input
            pInputText
            class="field-property-control"
            type="text"
            placeholder="e.g., model.myKey"
            [id]="keyInputId"
            [ngModel]="key()"
            [ngModelOptions]="{ updateOn: 'blur' }"
            (ngModelChange)="keyChange.emit($event)"
          />
        </core-field-property-wrapper>
        <core-field-property-wrapper
          label="Expression"
          description="JS expression — can use model, formState, field"
          [labelForId]="valueInputId"
        >
          <textarea
            class="field-property-control"
            rows="3"
            pTextarea
            placeholder="e.g., model.siblingKey.nested + 68"
            [id]="valueInputId"
            [ngModel]="value()"
            [ngModelOptions]="{ updateOn: 'blur' }"
            (ngModelChange)="valueChange.emit($event)"
          ></textarea>
        </core-field-property-wrapper>
      </div>
    </p-panel>
  `,
})
export class ExpressionItem {
  readonly index = input.required<number>();
  readonly key = input<string>();
  readonly value = input<string>();
  keyChange = output<string>();
  valueChange = output<string>();
  expressionChange = output<Expression>();
  remove = output<void>();

  dialogService = inject(ExpressionDialogService);

  keyInputId = `expression-item-key-input-${Math.random().toString(36).substring(2, 15)}`;
  valueInputId = `expression-item-value-input-${Math.random().toString(36).substring(2, 15)}`;

  openEditor(): void {
    if (!this.dialogService) {
      return;
    }

    const beautifiedText = beautifyCode(this.value() || '');
    this.dialogService.open({
      key: this.key() || '',
      value: beautifiedText,
      saveCallback: async (key: string, value: string) => {
        const singleLineText = await flattenToOneLine(value);
        this.expressionChange.emit({ key, value: singleLineText });
      },
    });
  }
}
