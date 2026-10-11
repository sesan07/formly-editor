import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButton } from 'primeng/selectbutton';
import { Tooltip } from '../../shared';
import { PreviewDevicePreset, PreviewViewportService } from './preview-viewport.service';

@Component({
  selector: 'core-preview-device-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonDirective, ButtonIcon, InputNumber, SelectButton, Tooltip],
  host: {
    class: 'flex flex-wrap items-center min-h-(--sub-panel-header-height) shrink-0 px-4 gap-2',
  },
  template: `
    <p-selectbutton
      aria-label="Preview device width"
      optionLabel="label"
      optionValue="value"
      allowEmpty="false"
      [options]="presetOptions"
      [ngModel]="viewport.preset()"
      (ngModelChange)="selectPreset($event)"
    />
    @if (viewport.preset() === 'custom') {
      <span class="inline-flex items-center gap-1">
        <p-inputnumber
          inputId="preview-custom-width"
          inputStyleClass="w-24"
          mode="decimal"
          suffix=" px"
          [min]="240"
          [max]="3840"
          [useGrouping]="false"
          [ngModel]="customWidthDraft()"
          (ngModelChange)="customWidthDraft.set($event)"
          (keydown.enter)="confirmCustomWidth()"
        />
        <button
          pButton
          text
          rounded
          aria-label="Confirm width"
          coreTooltip="Confirm width"
          tooltipPosition="top"
          [disabled]="!isCustomWidthValid()"
          (click)="confirmCustomWidth()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            check
          </i>
        </button>
      </span>
    }
    <span
      class="ml-auto text-sm whitespace-nowrap text-muted-color"
      aria-live="polite"
    >
      {{ viewport.targetWidth() ? viewport.targetWidth() + 'px' : 'Auto' }} · {{ scalePercent() }}%
    </span>
  `,
})
export class PreviewDeviceToolbar {
  readonly scale = input.required<number>();

  protected readonly viewport = inject(PreviewViewportService);
  protected readonly scalePercent = computed(() => Math.round(this.scale() * 100));
  protected readonly customWidthDraft = signal<number | null>(this.viewport.customWidth());
  protected readonly isCustomWidthValid = computed(() => {
    const width = this.customWidthDraft();
    return width !== null && Number.isFinite(width) && width >= 240 && width <= 3840;
  });
  protected readonly presetOptions: { label: string; value: PreviewDevicePreset }[] = [
    { label: 'Auto', value: 'auto' },
    { label: 'SM', value: 'sm' },
    { label: 'MD', value: 'md' },
    { label: 'LG', value: 'lg' },
    { label: 'XL', value: 'xl' },
    { label: 'Custom', value: 'custom' },
  ];

  protected selectPreset(preset: PreviewDevicePreset): void {
    this.viewport.selectPreset(preset);
    if (preset === 'custom') {
      this.resetCustomWidthDraft();
    }
  }

  protected resetCustomWidthDraft(): void {
    this.customWidthDraft.set(this.viewport.customWidth());
  }

  protected confirmCustomWidth(): void {
    const width = this.customWidthDraft();
    if (width !== null && this.isCustomWidthValid()) {
      this.viewport.setCustomWidth(width);
    }
  }
}
