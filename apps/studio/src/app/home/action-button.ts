import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';

@Component({
  selector: 'app-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, ButtonLabel],
  template: `
    <button
      pButton
      class="w-full justify-start p-4 text-left"
      type="button"
      [text]="text()"
      (click)="activated.emit()"
    >
      <i
        pButtonIcon
        class="material-symbols-outlined"
        >{{ icon() }}</i
      >
      <span class="flex flex-col items-start gap-1">
        <span
          pButtonLabel
          class="text-base"
          >{{ label() }}</span
        >
        <span class="text-color-secondary font-normal">{{ description() }}</span>
      </span>
    </button>
  `,
})
export class ActionButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input.required<string>();
  readonly text = input(false, { transform: booleanAttribute });
  readonly activated = output<void>();
}
