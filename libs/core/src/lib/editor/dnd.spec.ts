import { describe, expect, it } from 'vitest';
import { DropAction } from './types';
import { DNDService } from './dnd.service';

describe('DNDService', () => {
  let service: DNDService;

  beforeEach(() => {
    service = new DNDService();
  });

  it('defaults drag data to null', () => {
    expect(service.activeDragData()).toBeNull();
    expect(service.activeDragOverData()).toBeNull();
  });

  it('sets and gets active drag data', () => {
    const dragData = { action: DropAction.COPY, fieldType: 'input', fieldId: 'field-1' };
    service.setActiveDragData(dragData);
    expect(service.activeDragData()).toEqual(dragData);

    service.setActiveDragData(null);
    expect(service.activeDragData()).toBeNull();
  });

  it('sets and gets active drag over data', () => {
    const dragOverData = { fieldId: 'f-1', clientX: 100 };
    service.setActiveDragOverData(dragOverData);
    expect(service.activeDragOverData()).toEqual(dragOverData);

    service.setActiveDragOverData(null);
    expect(service.activeDragOverData()).toBeNull();
  });
});
