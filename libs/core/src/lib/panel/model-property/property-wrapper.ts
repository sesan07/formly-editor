import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { MouseInsideService } from '../../editor/mouse-inside.service';

@Component({
  selector: 'core-model-property-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: {
    class: 'relative flex items-center rounded-lg hover:bg-content-hover-background',
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
      class="flex min-w-0 grow items-center justify-between gap-2 py-1 pr-1"
      [style.paddingLeft]="paddingLeft()"
    >
      <ng-content />
      <span
        class="touch-actions-visible inline-flex shrink-0 gap-2 opacity-0"
        [class.opacity-100]="isMouseInside() || alwaysShowActions()"
      >
        <ng-content select="[actions]" />
      </span>
    </div>
  `,
})
export class ModelPropertyWrapper {
  readonly level = input(0, { transform: numberAttribute });
  readonly isTabRoot = input(false, { transform: booleanAttribute });
  readonly alwaysShowActions = input(false, { transform: booleanAttribute });

  protected mouseInsideService = inject(MouseInsideService);

  isMouseInsideRoot = this.mouseInsideService.isMouseInside;
  linePaddingLeft = `calc(var(--spacing) * 3.75)`;

  readonly isMouseInside = signal(false);
  readonly lines = computed(() => Array.from({ length: this.level() }, (_, i) => i));
  readonly paddingLeft = computed(
    () => `calc(((var(--spacing) * 4) * ${this.level()}) + var(--spacing))`,
  );
}
