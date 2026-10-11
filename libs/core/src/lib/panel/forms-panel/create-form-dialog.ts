import { CoreFormService } from '../../editor/core-form.service';
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { CoreLibraryService } from '../../config/core-library.service';
import { CreateFormDialogService } from './create-form-dialog.service';

const BLANK_TEMPLATE_ID = 'blank';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FormlyFieldConfig[];
  model: Record<string, unknown>;
  libraryId?: string;
  libraryLabel?: string | null;
}

@Component({
  selector: 'core-create-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Dialog,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    FloatLabel,
    InputText,
    FormsModule,
    RadioButton,
    Message,
    Select,
  ],
  template: `
    <p-dialog
      modal
      header="Create Form"
      [style]="{
        width: '800px',
        maxWidth: 'calc(100vw - 32px)',
        height: '600px',
        maxHeight: 'calc(100vh - 32px)',
      }"
      [pt]="dialogPT"
      [visible]="dialogService.isOpen()"
      (visibleChange)="onVisibilityChange($event)"
    >
      <form
        #form="ngForm"
        class="flex h-full min-h-0 flex-col"
      >
        <div class="grid w-full shrink-0 grid-cols-1 items-start gap-4 py-2 sm:grid-cols-2">
          <div class="min-w-0">
            <p-floatlabel variant="on">
              <input
                #nameModel="ngModel"
                class="w-full"
                name="name"
                pInputText
                required
                autocomplete="off"
                data-bwignore
                [id]="nameInputId"
                [ngModel]="formName()"
                (ngModelChange)="formName.set($event)"
              />
              <label [for]="nameInputId">Name</label>
            </p-floatlabel>
            @if (!nameModel.valid && nameModel.touched) {
              <p-message
                class="mt-1 inline-block"
                severity="error"
                size="small"
                variant="simple"
                >Name is required.</p-message
              >
            }
          </div>
          @if (selectedTemplateId() === blankTemplateId) {
            <div class="min-w-0">
              <p-floatlabel variant="on">
                <p-select
                  #libraryModel="ngModel"
                  class="w-full"
                  name="formlyUI"
                  required
                  checkmark
                  optionLabel="label"
                  optionValue="id"
                  [inputId]="selectedLibraryInputId"
                  [options]="libraryOptions"
                  [(ngModel)]="selectedLibrary"
                />
                <label [for]="selectedLibraryInputId">UI Library</label>
              </p-floatlabel>
              @if (!libraryModel.valid && libraryModel.touched) {
                <p-message
                  class="mt-1 inline-block"
                  severity="error"
                  size="small"
                  variant="simple"
                  >UI Library is required.</p-message
                >
              }
            </div>
          }
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-auto">
          <span class="text-content-secondary text-sm font-medium">Select a Template</span>

          <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            @for (template of templates; track template.id) {
              <label
                [for]="'template-' + template.id"
                [class]="
                  'flex flex-1 cursor-pointer items-start gap-2 rounded-lg border p-4 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 ' +
                  (selectedTemplateId() === template.id ? 'border-primary' : 'border-surface')
                "
              >
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="flex min-w-0 flex-wrap items-center gap-2">
                    <i class="material-symbols-outlined">{{ template.icon }}</i>
                    <span class="min-w-0 leading-none font-medium">{{ template.name }}</span>

                    @if (template.libraryLabel) {
                      <span class="inline-flex items-center gap-2 text-sm text-muted-color">
                        <span>&bull;</span>
                        <span>{{ template.libraryLabel }}</span>
                      </span>
                    }
                  </div>
                  <span class="text-sm text-surface-500">{{ template.description }}</span>
                </div>
                <p-radiobutton
                  #templateModel="ngModel"
                  name="template"
                  required
                  [inputId]="'template-' + template.id"
                  [value]="template.id"
                  [ngModel]="selectedTemplateId()"
                  (ngModelChange)="selectedTemplateId.set($event)"
                />
              </label>
            }
          </div>
        </div>
      </form>

      <ng-template #footer>
        <button
          pButton
          [disabled]="!form.valid"
          (click)="createForm()"
        >
          <span pButtonLabel>Create Form</span>
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            arrow_forward
          </i>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class CreateFormDialog {
  protected readonly form = viewChild.required('form', { read: NgForm });

  protected dialogService = inject(CreateFormDialogService);
  protected libraryService = inject(CoreLibraryService);
  protected formService = inject(CoreFormService);

  blankTemplateId = BLANK_TEMPLATE_ID;
  nameInputId = 'create-form-name';
  selectedLibraryInputId = 'create-form-selected-library';
  libraryOptions = this.libraryService.libraryOptions;

  readonly formName = signal('New Form');
  readonly selectedTemplateId = signal(BLANK_TEMPLATE_ID);
  readonly selectedLibrary = signal(this.libraryOptions[0]?.id);

  dialogPT: DialogPassThrough = {
    root: {
      style: { overflow: 'hidden' },
    },
    header: {
      style: { height: '5rem' },
    },
    content: {
      style: { height: 'calc(100% - 10rem)', overflow: 'hidden' },
    },
    footer: {
      style: { height: '5rem', alignItems: 'center' },
    },
  };

  readonly templates: FormTemplate[] = [
    {
      id: BLANK_TEMPLATE_ID,
      name: 'Blank Form',
      description: 'Start from scratch with an empty canvas and build your structure manually.',
      icon: 'note_add',
      fields: [],
      model: {},
    },
    ...this.libraryService.formTemplates.map((template) => ({
      id: template.id || `${template.name}-${template.libraryId}`,
      name: template.name,
      description: template.description ?? '',
      icon: template.icon ?? 'description',
      fields: template.fields,
      model: template.model,
      libraryId: template.libraryId,
      libraryLabel: this.libraryService.getLibraryLabel(template.libraryId),
    })),
  ];

  constructor() {
    effect(() => {
      if (!this.dialogService.isOpen()) {
        this.reset();
      }
    });
  }

  protected reset(): void {
    this.formName.set('New Form');
    this.selectedTemplateId.set(BLANK_TEMPLATE_ID);
    this.selectedLibrary.set(this.libraryOptions[0]?.id);
    this.form().resetForm({
      name: this.formName(),
      template: this.selectedTemplateId(),
    });
  }

  onVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.dialogService.close();
    }
  }

  createForm(): void {
    const selectedTemplateId = this.selectedTemplateId();
    const template = this.templates.find((t) => t.id === selectedTemplateId);
    if (!template) {
      return;
    }

    const formlyUIIdValue = this.selectedLibrary();
    const libraryId =
      selectedTemplateId === BLANK_TEMPLATE_ID ? formlyUIIdValue : template.libraryId;
    if (!libraryId) {
      return;
    }

    this.formService
      .addForm$(
        this.formName().trim(),
        template.fields,
        template.model,
        libraryId,
        true,
        this.dialogService.parentId(),
      )
      .subscribe();

    this.dialogService.close();
  }

  close(): void {
    this.dialogService.close();
  }
}
