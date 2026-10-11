import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { MarkdownDialogService } from './markdown-dialog.service';
import { Tooltip } from '../../shared/tooltip';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { MarkdownPropertyConfig } from './markdown.config';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-markdown-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, FieldPropertyWrapper, FormsModule, Textarea, Tooltip],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="textareaId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <span class="inline-flex w-full items-start gap-2">
        <textarea
          pTextarea
          class="field-property-control"
          rows="5"
          [id]="textareaId"
          [placeholder]="property().placeholder || ''"
          [ngModel]="currentValue()"
          (ngModelChange)="onValueChange($event)"
        ></textarea>
        <button
          class="shrink-0"
          pButton
          text
          rounded
          type="button"
          aria-label="Open Markdown editor"
          coreTooltip="Open Markdown editor"
          tooltipPosition="top"
          (click)="openEditor()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            >code_blocks</i
          >
        </button>
      </span>
    </core-field-property-wrapper>
  `,
})
export class FieldMarkdownProperty extends BaseProperty<MarkdownPropertyConfig, string> {
  private readonly dialogService = inject(MarkdownDialogService);

  protected defaultValue = '';
  protected propertyType = PropertyType.MARKDOWN;
  readonly textareaId = `markdown-property-textarea-${Math.random().toString(36).substring(2, 15)}`;

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string): void {
    if (value === '' && this.property().clearOnEmpty !== false) {
      this._clear();
    } else {
      this._modifyValue(value);
    }
  }

  openEditor(): void {
    this.dialogService.open({
      value: this.currentValue(),
      saveCallback: (value) => this.onValueChange(value),
    });
  }

  protected override _isValidProperty(x: unknown): x is MarkdownPropertyConfig {
    return this._isBaseProperty(x);
  }
}
