import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFieldService } from '../../config/core-field.service';
import { CoreFormService } from '../../editor/core-form.service';
import { PropertyChangeType } from '../../properties/types';
import { modifyPropertyTarget } from '../../properties/utils';
import { tailwindConfig } from './config/tailwind';
import { StylingOption } from './styling-option';
import { ClassType, CORE_STYLES_CONFIG, StylesConfig } from './types';

describe('StylingOption', () => {
  const activeField = signal<{ className?: string | null; fieldGroupClassName?: string | null }>({
    className: '',
    fieldGroupClassName: '',
  });
  const width = tailwindConfig.className[1].options[1];
  const system = tailwindConfig.fieldGroupClassName[0].options[0];
  let component: StylingOption;
  let fixture: ComponentFixture<StylingOption>;
  let config: StylesConfig;
  const changed = vi.fn();

  beforeEach(() => {
    changed.mockReset();
    activeField.set({ className: '', fieldGroupClassName: '' });
    config = { ...tailwindConfig, className: [...tailwindConfig.className] };
    TestBed.overrideComponent(StylingOption, { set: { imports: [], template: '' } });
    TestBed.configureTestingModule({
      imports: [StylingOption],
      providers: [
        { provide: CoreFormService, useValue: { activeField } },
        {
          provide: CoreFieldService,
          useValue: {
            classNamePath: ['className'],
            fieldGroupClassNamePath: ['fieldGroupClassName'],
          },
        },
        { provide: CORE_STYLES_CONFIG, useValue: config },
      ],
    });
    fixture = TestBed.createComponent(StylingOption);
    fixture.componentRef.setInput('option', width);
    fixture.componentRef.setInput('breakpoint', tailwindConfig.breakpoints[0]);
    fixture.componentRef.setInput('classType', ClassType.CLASS_NAME);
    component = fixture.componentInstance;
    component.fieldChange.subscribe((change) => {
      changed(change);
      activeField.update((field) => modifyPropertyTarget(field, change));
    });
  });

  it('clears only the selected option, preserving custom and responsive classes', () => {
    activeField.set({ className: 'w-4 w-8 mt-2 sm:w-4 custom', fieldGroupClassName: '' });
    component['clear']();
    expect(activeField().className).toBe('mt-2 sm:w-4 custom');
    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['className'],
      value: 'mt-2 sm:w-4 custom',
    });
    expect(component.selectedVariant()).toBeUndefined();
  });

  it('unsets the property only when its last classes are removed', () => {
    activeField.set({ className: 'w-4\tw-8', fieldGroupClassName: '' });
    component['clear']();
    expect(changed).toHaveBeenCalledWith({ type: PropertyChangeType.CLEAR, path: ['className'] });
    expect(activeField()).not.toHaveProperty('className');
  });

  it('replaces all conflicts and reflects the new selection', () => {
    activeField.set({ className: 'w-4\tw-8\nw-1x5 custom', fieldGroupClassName: '' });
    component.selectVariant('1.5');
    expect(activeField().className).toBe('w-1x5 custom w-1.5');
    expect(component.selectedVariant()).toBe('1.5');
    component.selectVariant('1.5');
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('cleans local grid dependencies at every breakpoint but preserves child-grid metadata', () => {
    fixture.componentRef.setInput('option', system);
    fixture.componentRef.setInput('classType', ClassType.FIELD_GROUP_CLASS_NAME);
    activeField.set({
      className: 'col-span-2 custom',
      fieldGroupClassName: 'grid grid-cols-2 md:grid-rows-3 gap-4 custom',
    });
    component.selectVariant('grid');
    expect(changed).not.toHaveBeenCalled();
    component.selectVariant('flex');
    expect(activeField()).toEqual({
      className: 'col-span-2 custom',
      fieldGroupClassName: 'gap-4 custom flex',
    });
  });

  it('clears dependencies on the correct property using the full configuration', () => {
    config.className.push({
      name: 'Custom dependencies',
      options: [
        {
          name: 'Grid item',
          value: 'item',
          variants: ['1'],
          hasBreakpoints: true,
          dependsOn: { type: ClassType.FIELD_GROUP_CLASS_NAME, value: 'grid' },
        },
      ],
    });
    fixture.componentRef.setInput('option', system);
    fixture.componentRef.setInput('classType', ClassType.FIELD_GROUP_CLASS_NAME);
    activeField.set({ className: 'item-1 sm:item-1 custom', fieldGroupClassName: 'grid' });
    component['clear']();
    expect(changed).toHaveBeenNthCalledWith(1, {
      type: PropertyChangeType.CLEAR,
      path: ['fieldGroupClassName'],
    });
    expect(changed).toHaveBeenNthCalledWith(2, {
      type: PropertyChangeType.VALUE,
      path: ['className'],
      value: 'custom',
    });
    expect(activeField()).toEqual({ className: 'custom' });
  });

  it('updates only the requested responsive breakpoint', () => {
    fixture.componentRef.setInput('breakpoint', tailwindConfig.breakpoints[1]);
    activeField.set({ className: 'w-4 sm:w-8 md:w-4 hover:sm:w-4', fieldGroupClassName: '' });
    component.selectVariant('1/2');
    expect(activeField().className).toBe('w-4 md:w-4 hover:sm:w-4 sm:w-1/2');
    expect(component.selectedVariant()).toBe('1/2');
    component['clear']();
    expect(activeField().className).toBe('w-4 md:w-4 hover:sm:w-4');
  });

  it('does not rewrite unrelated class properties or sanitize preexisting invalid dependencies', () => {
    activeField.set({ className: 'w-4', fieldGroupClassName: 'grid-cols-2\tcustom' });
    component.selectVariant('8');
    expect(activeField().fieldGroupClassName).toBe('grid-cols-2\tcustom');
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('reflects raw class edits and rejects unconfigured selections', () => {
    activeField.set({ className: 'w-1/2', fieldGroupClassName: '' });
    expect(component.selectedVariant()).toBe('1/2');
    activeField.set({ className: 'w-4', fieldGroupClassName: '' });
    expect(component.selectedVariant()).toBe('4');
    component.selectVariant('invalid');
    expect(changed).not.toHaveBeenCalled();
  });

  it('handles null class values emitted when the last chip is removed', () => {
    activeField.set({ className: null, fieldGroupClassName: null });
    expect(component.selectedVariant()).toBeUndefined();
    component.selectVariant('4');
    expect(activeField()).toEqual({ className: 'w-4', fieldGroupClassName: null });
    expect(component.selectedVariant()).toBe('4');
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
