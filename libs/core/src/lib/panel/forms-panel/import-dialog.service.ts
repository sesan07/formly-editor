import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImportDialogService {
  protected readonly isOpenSrc = signal(false);
  readonly isOpen = this.isOpenSrc.asReadonly();

  protected onImportedCallback: ((formId: string) => void) | null = null;

  open(onImported?: (formId: string) => void): void {
    this.onImportedCallback = onImported ?? null;
    this.isOpenSrc.set(true);
  }

  close(): void {
    this.isOpenSrc.set(false);
    this.onImportedCallback = null;
  }

  notifyImported(formId: string): void {
    this.onImportedCallback?.(formId);
  }
}
