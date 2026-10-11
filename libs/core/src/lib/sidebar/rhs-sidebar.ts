import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from '../editor/panel.service';
import { RHSPanelType } from '../editor/types';
import { FieldEditPanel, ModelEditPanel, PanelOptionConfig, StylingPanel } from '../panel';
import { ValidationPanel } from '../panel/validation-panel/validation-panel';
import { PanelPopAnimator } from '../shared';
import { PanelOptionList } from './panel-option-list';

@Component({
  selector: 'core-rhs-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldEditPanel,
    ValidationPanel,
    StylingPanel,
    ModelEditPanel,
    PanelPopAnimator,
    PanelOptionList,
  ],
  host: { class: 'flex h-full min-h-0 min-w-0 shrink-0' },
  template: `
    @switch (activePanel()) {
      @case ('field-edit') {
        <core-field-edit-panel
          class="panel"
          corePanelPopAnimator
          panelType="field-edit"
        />
      }
      @case ('styling') {
        <core-styling-panel
          class="panel"
          corePanelPopAnimator
          panelType="styling"
        />
      }
      @case ('validation') {
        <core-validation-panel
          class="panel"
          corePanelPopAnimator
          panelType="validation"
        />
      }
      @case ('model') {
        <core-model-edit-panel
          class="panel"
          corePanelPopAnimator
          panelType="model"
        />
      }
    }
    <core-panel-option-list
      position="right"
      [options]="panelOptions"
      [value]="activePanel()"
      (valueChange)="setActivePanel($event)"
    />
  `,
})
export class RHSSidebar {
  protected panelService = inject(PanelService);

  activePanel = this.panelService.activeRHSPanel;
  panelOptions: PanelOptionConfig[] = [
    {
      label: 'Field Edit',
      value: 'field-edit',
      matIcon: 'edit_square',
    },
    {
      label: 'Validation',
      value: 'validation',
      matIcon: 'rule',
    },
    {
      label: 'Styling',
      value: 'styling',
      matIcon: 'palette',
    },
    {
      label: 'Model',
      value: 'model',
      matIcon: 'database',
    },
  ];

  setActivePanel(panel: string) {
    this.panelService.setActiveRHSPanel(panel as RHSPanelType);
  }
}
