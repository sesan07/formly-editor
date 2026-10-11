import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tooltip } from '../shared';

@Component({
  selector: 'core-panel-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, Tooltip, ButtonLabel],
  host: {
    class: 'flex',
  },
  template: `
    @if (position() === 'left') {
      <div
        class="h-18 w-1.5 bg-primary opacity-0"
        [class.opacity-100]="isActive()"
      ></div>
    }
    <button
      class="flex size-18 flex-col items-center justify-center rounded-none px-0.5"
      pButton
      text
      [attr.aria-label]="'Open ' + label() + ' panel'"
      [coreTooltip]="label()"
      [tooltipPosition]="position() === 'right' ? 'left' : 'right'"
      (click)="selected.emit()"
    >
      <i
        pButtonIcon
        class="material-symbols-outlined"
        >{{ matIcon() }}</i
      >
      <span
        pButtonLabel
        class="text-xs"
      >
        {{ label() }}
      </span>
    </button>
    @if (position() === 'right') {
      <div
        class="h-18 w-1.5 bg-primary opacity-0"
        [class.opacity-100]="isActive()"
      ></div>
    }
  `,
})
export class PanelOption {
  readonly label = input<string>();
  readonly value = input<string>();
  readonly matIcon = input<string>();
  readonly isActive = input(false, { transform: booleanAttribute });
  readonly position = input<'left' | 'right'>('left');

  selected = output();
}
