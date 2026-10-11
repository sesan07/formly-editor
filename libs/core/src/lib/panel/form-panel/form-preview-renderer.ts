import { CoreFormService } from '../../editor/core-form.service';
import {
  FormlyFieldConfig,
  FormlyForm,
  FormlyFormOptions,
  provideFormlyCore,
} from '@ngx-formly/core';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfigService } from '../../formly/formly-config.service';
import { CORE_BUILDER_FORM } from '../../formly/types';

@Component({
  selector: 'core-form-preview-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideFormlyCore(),
    FormlyConfigService,
    { provide: CORE_BUILDER_FORM, useValue: false },
  ],
  imports: [FormlyForm],
  template: `
    <formly-form
      [fields]="clonedFormFields()"
      [model]="model()"
      [form]="formGroup"
      [options]="options"
      (modelChange)="onFormModelChanged($event)"
    />
  `,
})
export class FormPreviewRenderer {
  readonly formFields = input<FormlyFieldConfig[]>([]);

  protected readonly formService = inject(CoreFormService);
  protected readonly formlyConfig = inject(FormlyConfigService);
  protected readonly clonedFormFields = computed(() => structuredClone(this.formFields()));
  protected readonly model = computed(() => structuredClone(this.formService.activeModel()));

  formGroup = new FormGroup({});
  options: FormlyFormOptions = {};

  constructor() {
    effect(() => {
      this.formFields();
      this.formlyConfig.loadLibraryConfigOptions();
      this.formGroup = new FormGroup({});
      this.options = {};
    });
  }

  protected onFormModelChanged(model: Record<string, unknown>): void {
    this.formService.setActiveModel(model);
  }
}
