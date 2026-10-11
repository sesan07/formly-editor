import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldDropPosition } from '../editor/types';

@Component({
  selector: 'core-formly-field-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'absolute flex inset-0 pointer-events-none touch-none transition-opacity rounded-sm opacity-0',
    '[class.opacity-100]': 'canDrop()',
  },
  template: `
    @if (showSides()) {
      <div
        class="flex h-full flex-1 flex-col items-center justify-center bg-green-200 opacity-0 transition-opacity"
        [class.opacity-50]="hoverPosition() === 'left'"
      >
        <i
          class="material-symbols-outlined text-black"
          style="font-size: 42px;"
        >
          arrow_left
        </i>
      </div>
    }
    @if (showCenter()) {
      <div
        class="flex h-full flex-1 flex-col items-center justify-center bg-green-200 opacity-0 transition-opacity"
        [class.opacity-50]="hoverPosition() === 'center'"
      >
        <i
          class="material-symbols-outlined text-black"
          style="font-size: 42px;"
        >
          add
        </i>
      </div>
    }
    @if (showSides()) {
      <div
        class="flex h-full flex-1 flex-col items-center justify-center bg-green-200 opacity-0 transition-opacity"
        [class.opacity-50]="hoverPosition() === 'right'"
      >
        <i
          class="material-symbols-outlined text-black"
          style="font-size: 42px;"
        >
          arrow_right
        </i>
      </div>
    }
  `,
})
export class FormlyFieldOverlay {
  readonly canDrop = input.required({ transform: booleanAttribute });
  readonly hoverPosition = input.required<FieldDropPosition | null>();
  readonly showCenter = input(false, { transform: booleanAttribute });
  readonly showSides = input(false, { transform: booleanAttribute });
}
