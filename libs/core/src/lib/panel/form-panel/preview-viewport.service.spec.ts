import { describe, expect, it } from 'vitest';
import { PREVIEW_DEVICE_WIDTHS, PreviewViewportService } from './preview-viewport.service';

describe('PreviewViewportService', () => {
  it('uses the configured width for each preset', () => {
    const service = new PreviewViewportService();

    expect(service.targetWidth()).toBeNull();

    for (const [preset, width] of Object.entries(PREVIEW_DEVICE_WIDTHS)) {
      service.selectPreset(preset as keyof typeof PREVIEW_DEVICE_WIDTHS);
      expect(service.targetWidth()).toBe(width);
    }
  });

  it('switches to Custom and bounds manually entered widths', () => {
    const service = new PreviewViewportService();

    service.setCustomWidth(500);
    expect(service.preset()).toBe('custom');
    expect(service.targetWidth()).toBe(500);

    service.setCustomWidth(1);
    expect(service.targetWidth()).toBe(240);

    service.setCustomWidth(5000);
    expect(service.targetWidth()).toBe(3840);
  });
});
