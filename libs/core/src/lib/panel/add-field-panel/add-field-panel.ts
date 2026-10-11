import { CoreFormService } from '../../editor/core-form.service';
import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { EmptyNoForm } from '../../empty';
import { AddFieldService } from './add-field.service';
import { ActiveFieldChip } from '../../shared/active-field-chip';
import { PanelHeader } from '../../shared/panel-header';
import { FieldsTabContent } from './fields-tab-content';
import { PresetsTabContent } from './presets-tab-content';

@Component({
  selector: 'core-add-field-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddFieldService],
  imports: [
    EmptyNoForm,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    PanelHeader,
    FieldsTabContent,
    PresetsTabContent,
    ActiveFieldChip,
  ],
  host: {
    class: 'overflow-hidden h-full block',
  },
  template: `
    <core-panel-header
      header="Add Field"
      subHeader="Add or drag a field into the form"
    >
      <ng-container headerChip>
        <core-active-field-chip />
      </ng-container>
    </core-panel-header>
    @if (activeFormId()) {
      <p-tabs
        class="flex min-h-0 flex-1 flex-col"
        [(value)]="activeTab"
      >
        <p-tablist class="min-h-12.5 shrink-0 px-4">
          <p-tab
            class="flex items-center gap-2"
            value="fields"
          >
            <i class="material-symbols-outlined">ad</i>
            <span>Field</span>
          </p-tab>
          <p-tab
            class="flex items-center gap-2"
            value="presets"
          >
            <i class="material-symbols-outlined">tune</i>
            <span>Preset</span>
          </p-tab>
        </p-tablist>
        <p-tabpanels class="flex min-h-0 flex-1 flex-col px-0 pb-0">
          <p-tabpanel
            class="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
            value="fields"
          >
            <core-fields-tab-content />
          </p-tabpanel>
          <p-tabpanel
            class="flex min-h-0 flex-1 flex-col overflow-hidden"
            value="presets"
          >
            <core-presets-tab-content />
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    } @else {
      <core-empty-no-form />
    }
  `,
})
export class AddFieldPanel {
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);

  activeFormId = this.formService.activeFormId;
  activeField = this.formService.activeField;
  fieldCategoryPresets = this.fieldService.fieldCategoryPresets;

  readonly activeTab = signal<'fields' | 'presets'>('fields');
}
