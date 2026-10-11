import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CreateFormDialogService, ImportDialogService } from '@formly-editor/core';
import { vi } from 'vitest';

import { HomePage } from './home-page';

describe('HomePage', () => {
  const mockRouter = { navigateByUrl: vi.fn() };
  const mockCreateFormDialogService = { open: vi.fn() };
  const mockImportDialogService = { open: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.navigateByUrl.mockResolvedValue(true);

    TestBed.overrideComponent(HomePage, {
      set: { imports: [], template: '' },
    });
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CreateFormDialogService, useValue: mockCreateFormDialogService },
        { provide: ImportDialogService, useValue: mockImportDialogService },
      ],
    });
  });

  it('navigates before opening the create dialog', async () => {
    const component = TestBed.createComponent(HomePage).componentInstance;

    await component.createForm();

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/form-editor');
    expect(mockCreateFormDialogService.open).toHaveBeenCalledOnce();
  });

  it('navigates before opening the import dialog', async () => {
    const component = TestBed.createComponent(HomePage).componentInstance;

    await component.importForm();

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/form-editor');
    expect(mockImportDialogService.open).toHaveBeenCalledOnce();
  });

  it('does not open a dialog when navigation fails', async () => {
    const component = TestBed.createComponent(HomePage).componentInstance;
    mockRouter.navigateByUrl.mockResolvedValue(false);

    await component.createForm();
    await component.importForm();

    expect(mockCreateFormDialogService.open).not.toHaveBeenCalled();
    expect(mockImportDialogService.open).not.toHaveBeenCalled();
  });

  it('describes browser-local storage without account context', () => {
    const component = TestBed.createComponent(HomePage).componentInstance;

    expect(component['persistenceDescription']).toBe(
      'No account required. Your forms stay in this browser.',
    );
  });
});
