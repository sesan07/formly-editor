import { CoreFormService } from '../../editor/core-form.service';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { combineLatest, debounceTime, filter, map } from 'rxjs';
import { EmptyNoForm } from '../../empty';
import type { FormDisplayMode } from '../../editor/types';
import { JSONContent } from '../../json-content/json-content';
import { JSONFormatValidator } from '../../json-content/json-format-validator';
import { JSONSchemaValidator } from '../../json-content/json-schema-validator';
import { FormBuilderContent } from './form-builder-content';
import { FormPreviewContent } from './form-preview-content';
import { FormToolbarComponent } from './toolbar';

@Component({
  selector: 'core-form-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormToolbarComponent,
    FormBuilderContent,
    EmptyNoForm,
    Tabs,
    TabPanels,
    TabPanel,
    JSONContent,
    FormsModule,
    JSONFormatValidator,
    JSONSchemaValidator,
    FormPreviewContent,
  ],
  host: {
    class: 'flex flex-col h-full',
  },
  template: `
    @if (activeFormId()) {
      <core-form-toolbar class="shrink-0" />

      <p-tabs
        class="min-h-0 grow overflow-hidden"
        [value]="activeFormDisplayMode()"
        (valueChange)="setActiveFormDisplayMode($event)"
      >
        <p-tabpanels class="h-full min-h-0 p-0">
          <p-tabpanel
            class="block h-full overflow-y-auto px-4 pb-4"
            value="form"
          >
            <core-form-builder-content class="min-h-full" />
          </p-tabpanel>
          <p-tabpanel
            class="block h-full overflow-hidden"
            value="preview"
          >
            <core-form-preview-content
              class="h-full"
              [formFields]="(previewFields$ | async) ?? []"
            />
          </p-tabpanel>
          <p-tabpanel
            class="block h-full px-4 pb-4"
            value="json"
          >
            <core-json-content
              class="h-full"
              coreJsonFormat
              [coreJsonSchema]="schema()"
              [ngModel]="activeFormFieldsJSON()"
              [editable]="false"
            />
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    } @else {
      <core-empty-no-form />
    }
  `,
})
export class FormPanel {
  protected formService = inject(CoreFormService);

  activeFormId = this.formService.activeFormId;
  activeFormFieldsJSON = this.formService.activeFormFieldsJSON;
  activeFormDisplayMode = this.formService.activeFormDisplayMode;
  schema = this.formService.activeSchema;

  activePreviewFormFields$ = toObservable(this.formService.activePreviewFormFields).pipe(
    debounceTime(100),
  );
  displayMode$ = toObservable(this.activeFormDisplayMode);
  previewFields$ = combineLatest([this.displayMode$, this.activePreviewFormFields$]).pipe(
    filter(([mode]) => mode === 'preview'),
    map(([, fields]) => fields),
  );

  setActiveFormDisplayMode(mode?: string | number) {
    if (typeof mode === 'string') {
      this.formService.setActiveFormDisplayMode(mode as FormDisplayMode);
    }
  }
}
