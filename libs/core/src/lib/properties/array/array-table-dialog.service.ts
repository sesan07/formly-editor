import { Injectable, signal } from '@angular/core';

import { PropertyConfig } from '../types';

export interface ArrayTableDialogData {
  title: string;
  childProperties: PropertyConfig[];
  rows: Record<string, unknown>[];
  canAdd: boolean;
  canRemove: boolean;
  saveCallback: (rows: Record<string, unknown>[]) => void;
}

@Injectable()
export class ArrayTableDialogService {
  protected readonly _data = signal<ArrayTableDialogData | null>(null);
  readonly data = this._data.asReadonly();

  protected readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open(data: ArrayTableDialogData): void {
    this._data.set({
      ...data,
      childProperties: structuredClone(data.childProperties),
      rows: structuredClone(data.rows),
    });
    this._isOpen.set(true);
  }

  close(): void {
    this._data.set(null);
    this._isOpen.set(false);
  }
}
