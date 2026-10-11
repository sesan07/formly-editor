import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorField } from '../model/types';
import { BuilderFieldStateService } from './builder-field-state.service';
import { CoreFormService } from './core-form.service';

function field(id: string): EditorField {
  return {
    type: 'tabs',
    _info: { id, formId: 'form', name: id, childIds: [], idPath: [id] },
  };
}

describe('BuilderFieldStateService', () => {
  const first = field('first');
  const second = field('second');
  const fields = signal<Record<string, EditorField>>({});
  let service: BuilderFieldStateService;

  beforeEach(() => {
    fields.set({ first, second });
    TestBed.configureTestingModule({
      providers: [
        BuilderFieldStateService,
        { provide: CoreFormService, useValue: { activeFieldMap: fields.asReadonly() } },
      ],
    });
    service = TestBed.inject(BuilderFieldStateService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('restores state for a reconstructed field with the same ID', () => {
    service.setState(first, { selectedIndex: 1 });
    fields.set({ first: structuredClone(first), second });

    expect(service.getState(structuredClone(first))).toEqual({ selectedIndex: 1 });
    expect(service.getState(second)).toBeUndefined();
    expect(first).not.toHaveProperty('selectedIndex');
  });

  it('ignores fields without live editor metadata', () => {
    service.setState({}, { selectedIndex: 1 });
    service.setState(field('unknown'), { selectedIndex: 1 });

    expect(service.getState({})).toBeUndefined();
    expect(service.getState(field('unknown'))).toBeUndefined();
    fields.update((current) => ({ ...current, unknown: field('unknown') }));
    expect(service.getState(field('unknown'))).toBeUndefined();
  });

  it('prunes deleted fields while retaining surviving state', () => {
    service.setState(first, { selectedIndex: 1 });
    service.setState(second, { selectedIndex: 2 });
    fields.set({ second });

    expect(service.getState(second)).toEqual({ selectedIndex: 2 });
    expect(service.getState(first)).toBeUndefined();
    service.setState(first, { selectedIndex: 3 });
    fields.set({ first, second });
    expect(service.getState(first)).toBeUndefined();
  });

  it('resets when the form is unloaded or loaded with new IDs', () => {
    service.setState(first, { selectedIndex: 1 });
    fields.set({ reopened: field('reopened') });
    expect(service.getState(field('reopened'))).toBeUndefined();
    service.setState(field('reopened'), { selectedIndex: 2 });
    fields.set({});
    expect(service.getState(field('reopened'))).toBeUndefined();
    fields.set({ first });
    expect(service.getState(first)).toBeUndefined();
  });

  it('does not share state between editor injectors', () => {
    const otherEditor = Injector.create({
      providers: [
        BuilderFieldStateService,
        { provide: CoreFormService, useValue: { activeFieldMap: fields.asReadonly() } },
      ],
    });
    service.setState(first, { selectedIndex: 1 });

    expect(otherEditor.get(BuilderFieldStateService).getState(first)).toBeUndefined();
    otherEditor.destroy();
  });

  it('does not read or write browser storage', () => {
    const read = vi.spyOn(Storage.prototype, 'getItem');
    const write = vi.spyOn(Storage.prototype, 'setItem');
    service.setState(first, { selectedIndex: 1 });
    expect(service.getState(first)).toEqual({ selectedIndex: 1 });
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
