import { CoreFormService } from '../../editor/core-form.service';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, provideFormlyCore } from '@ngx-formly/core';
import { DndDropzoneDirective } from 'ngx-drag-drop';
import { debounceTime, tap } from 'rxjs';
import { EmptyNoField } from '../../empty';
import { DNDService } from '../../editor/dnd.service';
import { FormlyConfigService } from '../../formly/formly-config.service';
import { CORE_BUILDER_FORM } from '../../formly/types';
import { DropAction } from '../../editor/types';
import { CoreFormlyForm } from '../../formly/formly-form';

@Component({
  selector: 'core-form-builder-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideFormlyCore(),
    FormlyConfigService,
    { provide: CORE_BUILDER_FORM, useValue: true },
  ],
  imports: [CoreFormlyForm, DndDropzoneDirective, EmptyNoField, AsyncPipe],
  template: `
    @if (formFields$ | async; as formFields) {
      @if (formFields.length) {
        <core-formly-form
          [fields]="formFields"
          [model]="model()"
          [form]="formGroup"
          [options]="options"
          (modelChange)="onFormModelChanged($event)"
        />
      } @else {
        <core-empty-no-field
          class="block h-full w-full justify-start transition-colors"
          dndDropzone
          dndDragoverClass="bg-green-200/20"
          (dndDrop)="onDrop()"
        />
      }
    }
  `,
})
export class FormBuilderContent {
  protected formService = inject(CoreFormService);
  protected dndService = inject(DNDService);
  protected formlyConfig = inject(FormlyConfigService);

  formGroup: FormGroup = new FormGroup({});
  options: FormlyFormOptions = {};

  formFields$ = toObservable(this.formService.activeFormFields).pipe(
    debounceTime(100),
    tap(() => {
      this.formlyConfig.loadLibraryConfigOptions();
      this.formGroup = new FormGroup({});
      this.options = {};
    }),
  );

  model = this.formService.activeModel;

  onFormModelChanged(model: Record<string, unknown>): void {
    this.formService.setActiveModel(model);
  }

  onDrop() {
    const dragData = this.dndService.activeDragData();
    if (!dragData || this.dndService.activeDragData()?.action !== DropAction.COPY) {
      return;
    }

    this.formService.addField(dragData.fieldType, undefined, undefined, dragData.preset);
  }
}
