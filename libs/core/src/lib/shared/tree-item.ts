import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { MouseInsideService } from '../editor/mouse-inside.service';

@Component({
  selector: 'core-tree-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon],
  host: {
    class: 'relative flex items-center rounded-lg py-1.5 transition-colors select-none',
    '[class.bg-primary/20]': 'isActive()',
    '[class.bg-content-hover-background]': '!isActive() && alwaysShowActions()',
    '[class.hover:bg-content-hover-background]': '!isActive() && canInteract()',
    '[class.cursor-pointer]': 'canInteract()',
    '[tabindex]': 'isTabRoot() ? 0 : -1',
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <span
      class="pointer-events-none absolute inline-flex h-full pl-1"
      [class.opacity-100]="isMouseInsideRoot()"
      [class.opacity-0]="!isMouseInsideRoot()"
    >
      @for (lineIndex of lines(); track $index) {
        <span
          class="inline-block h-full w-0 border-r border-primary/20"
          [style.paddingLeft]="linePaddingLeft"
        ></span>
      }
    </span>

    <div
      class="flex min-w-0 grow items-center justify-between gap-2 pr-1"
      [style.paddingLeft]="paddingLeft()"
    >
      <div class="flex min-w-0 items-center gap-2 overflow-hidden">
        <button
          pButton
          text
          class="size-8 shrink-0"
          rounded
          aria-label="Toggle children"
          [class.invisible]="!isParent()"
          [class.disabled]="!isParent()"
          (click)="toggleClicked.emit($event)"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            style="font-size: 24px;"
            [class.rotate-90]="isExpanded()"
          >
            chevron_right
          </i>
        </button>
        <ng-content />
      </div>

      <span
        class="touch-actions-visible inline-flex shrink-0 gap-2 opacity-0"
        [class.opacity-100]="isMouseInside() || alwaysShowActions()"
      >
        <ng-content select="[actions]" />
      </span>
    </div>
  `,
})
export class TreeItem {
  readonly level = input(0, { transform: numberAttribute });
  readonly isTabRoot = input(false, { transform: booleanAttribute });
  readonly isExpanded = input(false, { transform: booleanAttribute });
  readonly isParent = input(false, { transform: booleanAttribute });
  readonly isActive = input(false, { transform: booleanAttribute });
  readonly canInteract = input(true, { transform: booleanAttribute });
  readonly alwaysShowActions = input(false, { transform: booleanAttribute });

  toggleClicked = output<MouseEvent>();

  protected mouseInsideService = inject(MouseInsideService);

  isMouseInsideRoot = this.mouseInsideService.isMouseInside;
  linePaddingLeft = `calc(var(--spacing) * 3.75)`;

  readonly isMouseInside = signal(false);
  readonly lines = computed(() => Array.from({ length: this.level() }, (_, i) => i));
  readonly paddingLeft = computed(
    () => `calc(((var(--spacing) * 4) * ${this.level()}) + var(--spacing))`,
  );
}
