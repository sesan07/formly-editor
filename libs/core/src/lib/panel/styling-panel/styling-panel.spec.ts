import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFieldService } from '../../config/core-field.service';
import { CoreFormService } from '../../editor/core-form.service';
import { EditorField } from '../../model/types';
import { PropertyChangeType } from '../../properties/types';
import { tailwindConfig } from './config/tailwind';
import { StylingPanel } from './styling-panel';
import { CORE_STYLES_CONFIG } from './types';

describe('StylingPanel', () => {
  const child: EditorField = {
    className: 'col-span-2 custom',
    _info: {
      id: 'child',
      idPath: ['parent', 'child'],
      childIds: [],
      name: 'Child',
      formId: 'form',
    },
  };
  const parent: EditorField = {
    fieldGroupClassName: 'grid',
    _info: {
      id: 'parent',
      idPath: ['parent'],
      childIds: ['child'],
      name: 'Parent',
      formId: 'form',
      isParent: true,
    },
  };
  const activeField = signal<EditorField | null>(null);
  const activeFieldMap = signal<Record<string, EditorField>>({});
  const modifyActiveField = vi.fn();
  let fixture: ComponentFixture<StylingPanel>;
  let panel: StylingPanel;

  beforeEach(() => {
    activeField.set(child);
    activeFieldMap.set({ parent, child });
    modifyActiveField.mockReset();
    TestBed.overrideComponent(StylingPanel, { set: { imports: [], template: '' } });
    TestBed.configureTestingModule({
      imports: [StylingPanel],
      providers: [
        { provide: CoreFormService, useValue: { activeField, activeFieldMap, modifyActiveField } },
        {
          provide: CoreFieldService,
          useValue: {
            classNamePath: ['className'],
            fieldGroupClassNamePath: ['fieldGroupClassName'],
          },
        },
        { provide: CORE_STYLES_CONFIG, useValue: tailwindConfig },
      ],
    });
    fixture = TestBed.createComponent(StylingPanel);
    panel = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('hides child grid controls after parent changes without rewriting child classes', () => {
    expect(
      panel.classNameMap()[''][0].options.some((option) => option.name === 'Column Span'),
    ).toBe(true);
    activeFieldMap.set({ parent: { ...parent, fieldGroupClassName: 'flex' }, child });
    expect(panel.classNameMap()[''][0].options.map((option) => option.name)).toEqual(['System']);
    expect(activeField()?.className).toBe('col-span-2 custom');
    expect(modifyActiveField).not.toHaveBeenCalled();
    activeFieldMap.set({ parent, child });
    expect(
      panel.classNameMap()['sm:'][0].options.some((option) => option.name === 'Column Span'),
    ).toBe(true);
  });

  it('uses literal parent and local tokens, not utility prefixes or responsive modifiers', () => {
    activeFieldMap.set({
      parent: { ...parent, fieldGroupClassName: 'sm:grid grid-cols-2' },
      child,
    });
    expect(panel.classNameMap()[''][0].options.map((option) => option.name)).toEqual(['System']);
    activeField.set({ ...parent, fieldGroupClassName: 'custom\tflex\nother' });
    expect(panel.fieldGroupClassNameMap()['sm:'][0].options.map((option) => option.name)).toEqual([
      'Flex Direction',
    ]);
    activeField.set({ ...parent, fieldGroupClassName: 'sm:flex flex-col' });
    expect(panel.fieldGroupClassNameMap()['sm:'][0].options).toEqual([]);
  });

  it('resets the children tab on leaf selection and handles no selection', () => {
    activeField.set(parent);
    fixture.detectChanges();
    panel.activeTab.set('children');
    activeField.set(child);
    fixture.detectChanges();
    expect(panel.activeTab()).toBe('self');
    activeField.set(null);
    expect(panel.classNameMap()).toEqual({});
    expect(panel.fieldGroupClassNameMap()).toEqual({});
  });

  it('forwards property changes through the existing immutable state gateway', () => {
    const change = { type: PropertyChangeType.VALUE, path: ['className'], value: 'custom' };
    panel.onFieldChanged(change);
    expect(modifyActiveField).toHaveBeenCalledExactlyOnceWith(change);
  });
});
