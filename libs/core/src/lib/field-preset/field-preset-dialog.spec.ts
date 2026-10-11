import { describe, expect, it } from 'vitest';
import { FieldPresetDialogService } from './field-preset-dialog.service';

describe('FieldPresetDialogService', () => {
  let service: FieldPresetDialogService;

  beforeEach(() => {
    service = new FieldPresetDialogService();
  });

  it('defaults to closed and empty data', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });

  it('opens dialog with data', () => {
    service.open({ name: 'Preset 1', json: '{}' });

    expect(service.isOpen()).toBe(true);
    expect(service.data()?.name).toBe('Preset 1');
  });

  it('closes dialog and clears data', () => {
    service.open({ name: 'Preset 1', json: '{}' });
    service.close();

    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });
});
