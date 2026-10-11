import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { SelectButton } from 'primeng/selectbutton';
import { CoreFormService } from '../../editor/core-form.service';
import { CoreLibraryService } from '../../config/core-library.service';
import { ExportDialogService } from './export-dialog.service';
import { PreviewDialogService } from './preview-dialog.service';
import { FormDisplayMode } from '../../editor/types';
import { Tooltip } from '../../shared';
import { NameEditPopover } from '../../shared/name-edit-popover';

@Component({
  selector: 'core-form-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    FormsModule,
    Tooltip,
    NameEditPopover,
    SelectButton,
    ButtonGroup,
  ],
  host: {
    class: 'flex min-h-(--panel-header-height) items-start px-4 py-2 md:items-center',
  },
  template: `
    <div class="flex min-w-0 grow flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="flex min-w-0 items-center gap-4">
        <div>
          <div
            #formNameTarget
            class="flex min-w-0 flex-col"
          >
            <span class="max-w-full truncate text-lg font-medium">{{ activeFormName() }} </span>
            <span class="flex items-center gap-1.5 text-sm text-muted-color">
              <span>{{ activeLibraryLabel() }}</span>
              <span>&bull;</span>
              <span>{{ activeFieldCount() }} Field{{ activeFieldCount() === 1 ? '' : 's' }}</span>
            </span>
          </div>
          <core-name-edit-popover
            #formNamePopover
            title="Edit form name"
            placeholder="Form name"
            [(value)]="formNameEditValue"
            (save)="setFormName()"
            (visibleChange)="formNamePopoverVisible.set($event)"
          />
        </div>
        <button
          pButton
          text
          rounded
          aria-label="Edit form name"
          coreTooltip="Edit form name"
          tooltipPosition="top"
          (click)="openFormNameEditor()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            edit
          </i>
        </button>
      </div>
      <div class="flex min-w-0 flex-wrap items-center gap-2 md:justify-end md:gap-4">
        <p-selectbutton
          optionLabel="label"
          optionValue="value"
          allowEmpty="false"
          [options]="displayModeOptions"
          [ngModel]="activeFormDisplayMode()"
          (ngModelChange)="setActiveFormDisplayMode($event)"
        />
        <div class="flex items-center gap-2 lg:gap-4">
          <div>
            <p-buttongroup>
              <button
                pButton
                severity="secondary"
                aria-label="Open preview"
                coreTooltip="Open preview"
                tooltipPosition="top"
                (click)="openPreviewDialog()"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  fullscreen
                </i>
              </button>
              <button
                pButton
                severity="secondary"
                aria-label="Clear Model"
                coreTooltip="Clear Model"
                tooltipPosition="top"
                (click)="clearModel()"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  restart_alt
                </i>
              </button>
            </p-buttongroup>
          </div>
          <div>
            <p-buttongroup>
              <button
                pButton
                severity="secondary"
                aria-label="Export Form"
                coreTooltip="Export Form"
                tooltipPosition="top"
                (click)="openExportDialog()"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  download
                </i>
              </button>
              <button
                pButton
                aria-label="Save Form"
                coreTooltip="Save Form"
                tooltipPosition="top"
                [disabled]="saveStatus() === 'saving'"
                [severity]="saveStatus() !== 'saved' ? 'primary' : 'secondary'"
                (click)="saveActiveForm()"
              >
                <i class="material-symbols-outlined"> save </i>
                <span pButtonLabel>{{ saveButtonLabel() }}</span>
              </button>
            </p-buttongroup>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FormToolbarComponent {
  protected formService = inject(CoreFormService);
  protected libraryService = inject(CoreLibraryService);
  private readonly previewDialogService = inject(PreviewDialogService);
  private readonly exportDialogService = inject(ExportDialogService);

  activeFormName = this.formService.activeFormName;
  activeFormId = this.formService.activeFormId;
  activeFormDisplayMode = this.formService.activeFormDisplayMode;
  activeFieldCount = this.formService.activeFieldCount;
  saveStatus = this.formService.saveStatus;
  activeLibraryLabel = this.libraryService.activeLibraryLabel;
  readonly formNamePopover = viewChild('formNamePopover', { read: NameEditPopover });
  readonly formNameTarget = viewChild('formNameTarget', { read: ElementRef });

  readonly formNameEditValue = signal('');
  readonly formNamePopoverVisible = signal(false);
  displayModeOptions = [
    { label: 'Builder', value: 'form' },
    { label: 'Preview', value: 'preview' },
    { label: 'JSON', value: 'json' },
  ];

  protected cachedDisplayMode: FormDisplayMode = this.formService.activeFormDisplayMode();
  private wasPreviewDialogOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.previewDialogService.isOpen();
      if (this.wasPreviewDialogOpen && !isOpen) {
        this.restoreDisplayMode();
      }
      this.wasPreviewDialogOpen = isOpen;
    });
  }

  saveButtonLabel = () => {
    switch (this.saveStatus()) {
      case 'dirty':
        return 'Save*';
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Retry save';
      default:
        return 'Save';
    }
  };

  openFormNameEditor() {
    this.formNameEditValue.set(this.activeFormName() ?? '');
    this.formNamePopover()?.show(this.formNameTarget()?.nativeElement);
  }

  setFormName() {
    const newName = this.formNameEditValue();
    this.formNameEditValue.set('');
    this.formNamePopover()?.hide();

    const activeFormId = this.activeFormId();
    if (!activeFormId || !newName.trim() || this.activeFormName() === newName) {
      return;
    }

    this.formService.setWorkspaceNodeName(activeFormId, newName);
  }

  saveActiveForm() {
    this.formService.saveActiveForm();
  }

  clearModel() {
    this.formService.setActiveModel({});
  }

  openPreviewDialog() {
    this.cachedDisplayMode = this.formService.activeFormDisplayMode();
    this.setActiveFormDisplayMode('preview');
    this.previewDialogService.open();
  }

  restoreDisplayMode() {
    this.formService.setActiveFormDisplayMode(this.cachedDisplayMode);
  }

  setActiveFormDisplayMode(mode: FormDisplayMode) {
    if (this.formService.activeFormDisplayMode() === mode) {
      return;
    }

    this.formService.setActiveFormDisplayMode(mode);
  }

  openExportDialog() {
    this.exportDialogService.open();
  }
}
