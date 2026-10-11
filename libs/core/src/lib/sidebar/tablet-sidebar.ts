import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from '../editor/panel.service';
import { LHSPanelType, RHSPanelType } from '../editor/types';
import {
  AddFieldPanel,
  FieldEditPanel,
  FieldsPanel,
  FormsPanel,
  ModelEditPanel,
  PanelOptionConfig,
  StylingPanel,
} from '../panel';
import { ValidationPanel } from '../panel/validation-panel/validation-panel';
import { PanelPopAnimator } from '../shared';
import { PanelOptionList } from './panel-option-list';

export const TABLET_PANEL_OPTIONS: PanelOptionConfig[] = [
  { label: 'Workspace', value: 'forms', matIcon: 'assignment' },
  { label: 'Fields', value: 'fields', matIcon: 'lists' },
  { label: 'Add Field', value: 'add-field', matIcon: 'add' },
  { label: 'Field Edit', value: 'field-edit', matIcon: 'edit_square' },
  { label: 'Validation', value: 'validation', matIcon: 'rule' },
  { label: 'Styling', value: 'styling', matIcon: 'palette' },
  { label: 'Model', value: 'model', matIcon: 'database' },
];

@Component({
  selector: 'core-tablet-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AddFieldPanel,
    FieldEditPanel,
    FieldsPanel,
    FormsPanel,
    ModelEditPanel,
    PanelOptionList,
    PanelPopAnimator,
    StylingPanel,
    ValidationPanel,
  ],
  host: { class: 'flex h-full min-w-0' },
  template: `
    <core-panel-option-list
      position="left"
      [options]="panelOptions"
      [value]="activePanel()"
      (valueChange)="setActivePanel($event)"
    />
    <div class="min-h-0 min-w-0 grow">
      @switch (activePanel()) {
        @case ('forms') {
          <core-forms-panel
            class="panel"
            corePanelPopAnimator
            panelType="forms"
          />
        }
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
    </div>
  `,
})
export class TabletSidebar {
  private readonly panelService = inject(PanelService);

  protected readonly activePanel = this.panelService.activePanel;
  protected readonly panelOptions = TABLET_PANEL_OPTIONS;

  setActivePanel(panel: string): void {
    this.panelService.setActivePanel(panel as LHSPanelType | RHSPanelType);
  }
}
