import { CoreFormService } from '../editor/core-form.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EmptyNoForm } from '../empty/empty-no-form';
import { JSONContent } from '../json-content/json-content';
import { JSONFormatValidator } from '../json-content/json-format-validator';
import { PanelHeader } from '../shared/panel-header';

@Component({
  selector: 'core-model-edit-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyNoForm, PanelHeader, JSONContent, FormsModule, JSONFormatValidator],
  template: `
    <core-panel-header
      header="Model"
      subHeader="Edit the active form model"
    />
    @if (activeForm()) {
      <form
        #form="ngForm"
        class="panel-content"
      >
        <core-json-content
          class="h-full"
          name="json"
          coreJsonFormat
          editable
          [ngModel]="activeModelJSON()"
          (ngModelChange)="modifyActiveModel($event)"
        />
      </form>
    } @else {
      <core-empty-no-form />
    }
  `,
})
export class ModelEditPanel {
  readonly form = viewChild.required(NgForm);

  protected formService = inject(CoreFormService);

  activeForm = this.formService.activeForm;
  activeModel = this.formService.activeModel;

  readonly isMouseOverContent = signal(false);

  readonly activeModelJSON = computed(() => JSON.stringify(this.activeModel(), null, 2));

  modifyActiveModel(newJSON: string) {
    if (this.form().valid) {
      this.formService.modifyActiveModel(newJSON);
    }
  }
}
