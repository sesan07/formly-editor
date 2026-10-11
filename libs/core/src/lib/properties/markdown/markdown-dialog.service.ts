import { Injectable, signal } from '@angular/core';
import { MarkdownDialogData } from './markdown-dialog.types';

@Injectable()
export class MarkdownDialogService {
  protected readonly _data = signal<MarkdownDialogData | null>(null);
  readonly data = this._data.asReadonly();

  protected readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open(data: MarkdownDialogData): void {
    this._data.set(data);
    this._isOpen.set(true);
  }

  close(): void {
    this._data.set(null);
    this._isOpen.set(false);
  }

  setValue(value: string): void {
    this._data.update((data) => (data ? { ...data, value } : data));
  }
}
