import { ChangeDetectionStrategy, Component, input, model, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'core-name-edit-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Popover, InputText, FormsModule],
  template: `
    <p-popover
      #popover
      (onShow)="visibleChange.emit(true)"
      (onHide)="visibleChange.emit(false)"
    >
      <div class="flex w-full max-w-72 flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="font-semibold">{{ title() }}</span>
        </div>
        <input
          type="text"
          pInputText
          [placeholder]="placeholder()"
          [(ngModel)]="value"
          (keydown.enter)="save.emit()"
        />
        <div class="flex w-full items-center justify-end">
          <div class="flex items-center gap-2">
            <button
              type="button"
              pButton
              severity="secondary"
              variant="outlined"
              size="small"
              (click)="popover.hide()"
            >
              Cancel
            </button>
            <button
              type="button"
              pButton
              size="small"
              (click)="save.emit()"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </p-popover>
  `,
})
export class NameEditPopover {
  readonly value = model.required<string>();
  readonly title = input.required<string>();
  readonly placeholder = input.required<string>();

  readonly save = output();
  readonly visibleChange = output<boolean>();

  readonly popover = viewChild('popover', { read: Popover });

  show(target: HTMLElement) {
    this.popover()?.show({ stopPropagation: () => {} }, target);
  }

  hide() {
    this.popover()?.hide();
  }
}
