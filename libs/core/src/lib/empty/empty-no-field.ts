import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { PanelService } from '../editor/panel.service';
import { Empty } from './empty';

@Component({
  selector: 'core-empty-no-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Empty, ButtonDirective],
  template: `
    <core-empty
      label="No field in this form"
      description="Add a field from the Add Field panel"
    >
      <button
        pButton
        (click)="openAddFieldPanel()"
      >
        <i class="material-symbols-outlined">open_in_new</i>
        Open Add Field Panel
      </button>
    </core-empty>
  `,
})
export class EmptyNoField {
  protected panelService = inject(PanelService);

  openAddFieldPanel() {
    this.panelService.setActiveLHSPanel('add-field');
  }
}
