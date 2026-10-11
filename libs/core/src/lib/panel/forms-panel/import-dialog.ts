import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { CoreFormService } from '../../editor/core-form.service';
import { CoreLibraryService } from '../../config/core-library.service';
import { ImportDialogService } from './import-dialog.service';
import { JSONContentDialog } from '../../json-content/json-content-dialog';

@Component({
  selector: 'core-import-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JSONContentDialog,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    FloatLabel,
    FormsModule,
    Message,
    Select,
    InputText,
  ],
  template: `
    <core-json-content-dialog
      class="text-base"
      header="Import Form"
      saveButtonLabel="Import Form"
      saveButtonIcon="upload"
      [isArrayRoot]="true"
      [schema]="schema()"
      [isOpen]="isOpen()"
      [(formFieldsJson)]="formFieldsJSON"
      (isOpenChange)="updateVisibility($event)"
      (save)="importForm()"
    >
      <ng-container formFields>
        <div>
          <p-floatlabel variant="on">
            <input
              #nameModel="ngModel"
              class="w-full"
              name="name"
              pInputText
              required
              autocomplete="off"
              data-bwignore
              id="import-dialog-name-input"
              [(ngModel)]="formName"
            />
            <label for="import-dialog-name-input">Name</label>
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
        <div>
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
              [(ngModel)]="selectedLibraryId"
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
      </ng-container>
      <ng-container lhsActions>
        <span>
          <button
            pButton
            text
            (click)="fileSelect.click()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              file_open
            </i>
            <span pButtonLabel>Choose File</span>
          </button>
          <input
            #fileSelect
            class="hidden"
            type="file"
            accept=".json, .txt"
            (input)="loadFromFile()"
          />
        </span>
      </ng-container>
    </core-json-content-dialog>
  `,
})
export class ImportDialog {
  readonly fileSelectElement = viewChild.required<ElementRef<HTMLInputElement>>('fileSelect');

  dialogService = inject(ImportDialogService);
  formService = inject(CoreFormService);
  protected libraryService = inject(CoreLibraryService);

  isOpen = this.dialogService.isOpen;
  selectedLibraryInputId = 'import-form-selected-library';
  libraryOptions = this.libraryService.libraryOptions;
  readonly schema = computed(() => {
    const selectedLibraryId = this.selectedLibraryId();
    if (!selectedLibraryId) {
      return undefined;
    }

    const selectedLibrary = this.libraryService.getLibrary(selectedLibraryId);
    return selectedLibrary?.enableFormUploadSchema ? selectedLibrary.schema : undefined;
  });

  readonly formName = signal('');
  readonly formFieldsJSON = signal('');
  readonly selectedLibraryId = signal(this.libraryOptions[0]?.id);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.formName.set('New Form');
        this.formFieldsJSON.set('[]');
        this.selectedLibraryId.set(this.libraryOptions[0]?.id);
      }
    });
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }

  loadFromFile(): void {
    const file: File | null = this.fileSelectElement().nativeElement.files?.item(0) ?? null;
    if (!file) return;

    const reader: FileReader = new FileReader();
    reader.onload = (readerEvent) => {
      const content: string = readerEvent.target?.result as string;
      if (content) {
        this.formFieldsJSON.set(content);
      }
    };

    reader.readAsText(file);
  }

  importForm() {
    let formFields: unknown;
    try {
      formFields = JSON.parse(this.formFieldsJSON());
    } catch {
      return;
    }
    if (!Array.isArray(formFields)) {
      return;
    }

    this.formService
      .addForm$(this.formName(), formFields, {}, this.selectedLibraryId(), true, null)
      .subscribe({
        next: () => {
          const activeFormId = this.formService.activeFormId();
          if (activeFormId) {
            this.dialogService.notifyImported(activeFormId);
          }
          this.dialogService.close();
        },
        error: () => undefined,
      });
  }
}
