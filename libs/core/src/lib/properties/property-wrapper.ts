import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Tooltip } from '../shared/tooltip';

@Component({
  selector: 'core-field-property-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tooltip, ButtonDirective, ButtonIcon],
  host: {
    class: 'flex flex-col gap-0.5',
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <div class="flex items-center justify-between gap-2">
      <label
        class="text-sm"
        tooltipPosition="left"
        [for]="labelForId()"
        [coreTooltip]="description()"
      >
        {{ label() }}
      </label>

      @if (isClearable()) {
        <button
          pButton
          text
          class="touch-actions-visible size-5 opacity-0 transition-opacity"
          rounded
          severity="danger"
          aria-label="Clear"
          coreTooltip="Clear"
          tooltipPosition="top"
          [class.opacity-100]="isMouseInside()"
          (click)="clear.emit()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            style="font-size: 1rem"
          >
            close
          </i>
        </button>
      }
    </div>

    <div class="flex items-center gap-2">
      <span class="inline-flex min-h-10 min-w-0 grow items-center gap-2">
        <ng-content />
      </span>
    </div>
  `,
})
export class FieldPropertyWrapper {
  readonly label = input<string>();
  readonly description = input<string>();
  readonly labelForId = input<string>();
  readonly isClearable = input(false, { transform: booleanAttribute });
  clear = output();

  readonly isMouseInside = signal(false);
}
