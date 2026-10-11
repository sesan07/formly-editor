import { Directive, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { PanelService } from '../editor/panel.service';
import { LHSPanelType, RHSPanelType } from '../editor/types';

@Directive({
  selector: '[corePanelPopAnimator]',
  host: {
    '(animationend)': 'endAnimation()',
  },
})
export class PanelPopAnimator {
  readonly panelType = input.required<LHSPanelType | RHSPanelType>();

  protected panelService = inject(PanelService);
  protected elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected renderer = inject(Renderer2);

  constructor() {
    this.panelService.highlightPanel$
      .pipe(
        takeUntilDestroyed(),
        filter((panel) => panel === this.panelType()),
      )
      .subscribe(() => {
        this.triggerEffect();
      });
  }

  triggerEffect() {
    this.renderer.addClass(this.elementRef.nativeElement, 'animate-panel-pop');
  }

  endAnimation() {
    this.renderer.removeClass(this.elementRef.nativeElement, 'animate-panel-pop');
  }
}
