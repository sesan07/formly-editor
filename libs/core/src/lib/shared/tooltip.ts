import { Directive, inject } from '@angular/core';
import { Tooltip as PrimeNGTooltip } from 'primeng/tooltip';

@Directive({
  selector: '[coreTooltip]',
  hostDirectives: [
    {
      directive: PrimeNGTooltip,
      inputs: ['pTooltip: coreTooltip', 'tooltipPosition', 'showDelay'],
    },
  ],
})
export class Tooltip {
  protected tooltip = inject(PrimeNGTooltip);

  constructor() {
    this.tooltip.setOption({ showDelay: 500 });
  }
}
