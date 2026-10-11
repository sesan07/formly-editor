import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';
import { PropertyChangeType } from '../types';
import { FieldWrappersProperty } from './wrappers';
import { createWrappersProperty } from './wrappers.config';

describe('FieldWrappersProperty', () => {
  let fixture: ComponentFixture<FieldWrappersProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldWrappersProperty],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldWrappersProperty);
    fixture.componentRef.setInput(
      'property',
      createWrappersProperty({
        label: 'Wrappers',
        key: 'wrappers',
        options: [
          { label: 'Card', value: 'card' },
          { label: 'Form Field', value: 'form-field' },
        ],
      }),
    );
    fixture.componentRef.setInput('path', ['wrappers']);
    fixture.componentRef.setInput('target', { wrappers: ['card'] });
    fixture.detectChanges();
  });

  it('emits selected wrappers in configured option order', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onValueChange(['form-field', 'card']);

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['wrappers'],
      value: ['card', 'form-field'],
    });
  });

  it('renders persisted wrappers in configured option order', () => {
    fixture.componentRef.setInput('target', { wrappers: ['form-field', 'card'] });
    fixture.detectChanges();

    expect(fixture.componentInstance.orderedValue()).toEqual(['card', 'form-field']);
  });

  it('keeps unknown wrappers after configured options', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onValueChange(['unknown', 'form-field', 'card', 'legacy']);

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['wrappers'],
      value: ['card', 'form-field', 'unknown', 'legacy'],
    });
  });

  it('clears all wrappers', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onClear();

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.CLEAR,
      path: ['wrappers'],
    });
  });

  it('clears when the selected wrappers become empty by default', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onValueChange([]);

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.CLEAR,
      path: ['wrappers'],
    });
  });

  it('persists an empty selection when clearOnEmpty is false', () => {
    fixture.componentRef.setInput(
      'property',
      createWrappersProperty({
        label: 'Wrappers',
        key: 'wrappers',
        options: [
          { label: 'Card', value: 'card' },
          { label: 'Form Field', value: 'form-field' },
        ],
        clearOnEmpty: false,
      }),
    );
    fixture.detectChanges();

    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onValueChange([]);

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['wrappers'],
      value: [],
    });
  });
});
