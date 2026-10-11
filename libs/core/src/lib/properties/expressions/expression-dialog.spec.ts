import { describe, expect, it, vi } from 'vitest';
import { ExpressionDialogService } from './expression-dialog.service';

describe('ExpressionDialogService', () => {
  let service: ExpressionDialogService;

  beforeEach(() => {
    service = new ExpressionDialogService();
  });

  it('defaults to closed with null data', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });

  it('opens and updates key and value', () => {
    service.open({ key: 'hide', value: 'model.foo === true', saveCallback: vi.fn() });
    expect(service.isOpen()).toBe(true);
    expect(service.data()).toEqual(
      expect.objectContaining({ key: 'hide', value: 'model.foo === true' }),
    );

    service.setKey('templateOptions.disabled');
    expect(service.data()?.key).toBe('templateOptions.disabled');

    service.setValue('false');
    expect(service.data()?.value).toBe('false');
  });

  it('closes dialog', () => {
    service.open({ key: 'k', value: 'v', saveCallback: vi.fn() });
    service.close();
    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });
});
