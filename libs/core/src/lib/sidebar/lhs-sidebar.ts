import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from '../editor/panel.service';
import { LHSPanelType } from '../editor/types';
import { FieldsPanel, PanelOptionConfig } from '../panel';
import { AddFieldPanel } from '../panel/add-field-panel/add-field-panel';
import { FormsPanel } from '../panel/forms-panel/forms-panel';
import { PanelPopAnimator } from '../shared';
import { PanelOptionList } from './panel-option-list';

@Component({
  selector: 'core-lhs-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldsPanel, AddFieldPanel, FormsPanel, PanelPopAnimator, PanelOptionList],
  host: { class: 'flex h-full min-h-0 min-w-0 shrink-0' },
  template: `
    <core-panel-option-list
      position="left"
      [options]="panelOptions"
      [value]="activePanel()"
      (valueChange)="setActivePanel($event)"
    />
    @switch (activePanel()) {
      @case ('fields') {
        <core-fields-panel
          class="panel"
          corePanelPopAnimator
          panelType="fields"
        />
      }
      @case ('add-field') {
        <core-add-field-panel
          class="panel"
          corePanelPopAnimator
          panelType="add-field"
        />
      }
      @case ('forms') {
        <core-forms-panel
          class="panel"
          corePanelPopAnimator
          panelType="forms"
        />
      }
    }
  `,
})
export class LHSSidebar {
  protected panelService = inject(PanelService);

  activePanel = this.panelService.activeLHSPanel;
  panelOptions: PanelOptionConfig[] = [
    {
      label: 'Workspace',
      value: 'forms',
      matIcon: 'assignment',
    },
    {
      label: 'Fields',
      value: 'fields',
      matIcon: 'lists',
    },
    {
      label: 'Add Field',
      value: 'add-field',
      matIcon: 'add',
    },
  ];

  setActivePanel(panel: string) {
    this.panelService.setActiveLHSPanel(panel as LHSPanelType);
  }
}
