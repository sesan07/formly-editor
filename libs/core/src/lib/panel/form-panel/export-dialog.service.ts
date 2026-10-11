import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportDialogService {
  protected readonly isOpenSrc = signal(false);
  readonly isOpen = this.isOpenSrc.asReadonly();

  open(): void {
    this.isOpenSrc.set(true);
  }

  close(): void {
    this.isOpenSrc.set(false);
  }
}
