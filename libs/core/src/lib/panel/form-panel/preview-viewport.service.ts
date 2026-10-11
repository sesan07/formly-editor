import { computed, Injectable, signal } from '@angular/core';

export const PREVIEW_DEVICE_WIDTHS = {
  auto: null,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type PreviewDevicePreset = keyof typeof PREVIEW_DEVICE_WIDTHS | 'custom';

const MIN_CUSTOM_WIDTH = 240;
const MAX_CUSTOM_WIDTH = 3840;

@Injectable({ providedIn: 'root' })
export class PreviewViewportService {
  private readonly presetSrc = signal<PreviewDevicePreset>('auto');
  private readonly customWidthSrc = signal<number>(PREVIEW_DEVICE_WIDTHS.sm);

  readonly preset = this.presetSrc.asReadonly();
  readonly customWidth = this.customWidthSrc.asReadonly();
  readonly targetWidth = computed(() => {
    const preset = this.preset();
    return preset === 'custom' ? this.customWidth() : PREVIEW_DEVICE_WIDTHS[preset];
  });

  selectPreset(preset: PreviewDevicePreset): void {
    this.presetSrc.set(preset);
  }

  setCustomWidth(width: number): void {
    if (!Number.isFinite(width)) {
      return;
    }

    this.customWidthSrc.set(
      Math.round(Math.min(MAX_CUSTOM_WIDTH, Math.max(MIN_CUSTOM_WIDTH, width))),
    );
    this.presetSrc.set('custom');
  }
}
