import { Injectable, signal } from '@angular/core';
import { ExpressionDialogData } from './expressions.types';

@Injectable()
export class ExpressionDialogService {
  protected readonly _data = signal<ExpressionDialogData | null>(null);
  readonly data = this._data.asReadonly();

  protected readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open(data: ExpressionDialogData) {
    this._data.set(data);
    this._isOpen.set(true);
  }

  close() {
    this._data.set(null);
    this._isOpen.set(false);
  }

  setKey(key: string) {
    this._data.update((d) => (d ? { ...d, key } : d));
  }

  setValue(value: string) {
    this._data.update((d) => (d ? { ...d, value } : d));
  }
}
