import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CreateFormDialogService {
  protected readonly isOpenSrc = signal(false);
  readonly isOpen = this.isOpenSrc.asReadonly();

  protected readonly parentIdSrc = signal<string | null>(null);
  readonly parentId = this.parentIdSrc.asReadonly();

  open(parentId: string | null = null): void {
    this.parentIdSrc.set(parentId);
    this.isOpenSrc.set(true);
  }

  close(): void {
    this.isOpenSrc.set(false);
    this.parentIdSrc.set(null);
  }
}
