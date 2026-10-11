import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownDialogService } from './markdown-dialog.service';

describe('MarkdownDialogService', () => {
  let service: MarkdownDialogService;

  beforeEach(() => {
    service = new MarkdownDialogService();
  });

  it('defaults to closed with null data', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });

  it('opens and updates the draft value', () => {
    service.open({ value: '# Initial', saveCallback: vi.fn() });

    expect(service.isOpen()).toBe(true);
    expect(service.data()?.value).toBe('# Initial');

    service.setValue('## Updated');

    expect(service.data()?.value).toBe('## Updated');
  });

  it('closes and discards the draft', () => {
    service.open({ value: '# Initial', saveCallback: vi.fn() });
    service.setValue('## Draft');

    service.close();

    expect(service.isOpen()).toBe(false);
    expect(service.data()).toBeNull();
  });
});
