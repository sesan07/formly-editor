import { Injectable, signal } from '@angular/core';
import { DragData, DragOverData } from './types';

@Injectable()
export class DNDService {
  private readonly _activeDragData = signal<DragData | null>(null);
  readonly activeDragData = this._activeDragData.asReadonly();

  private readonly _activeDragOverData = signal<DragOverData | null>(null);
  readonly activeDragOverData = this._activeDragOverData.asReadonly();

  setActiveDragData(data: DragData | null) {
    this._activeDragData.set(data);
  }

  setActiveDragOverData(data: DragOverData | null) {
    this._activeDragOverData.set(data);
  }
}
