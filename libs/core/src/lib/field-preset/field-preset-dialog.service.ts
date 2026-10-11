import { Injectable, signal } from '@angular/core';
import { FieldPresetDialogData } from './field-preset-dialog.types';

@Injectable()
export class FieldPresetDialogService {
  protected readonly _data = signal<FieldPresetDialogData | null>(null);
  readonly data = this._data.asReadonly();

  protected readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open(data: FieldPresetDialogData) {
    this._data.set(data);
    this._isOpen.set(true);
  }

  close() {
    this._data.set(null);
    this._isOpen.set(false);
  }
}
