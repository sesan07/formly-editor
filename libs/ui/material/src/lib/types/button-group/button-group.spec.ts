import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { By } from '@angular/platform-browser';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ButtonGroupType } from './button-group';
import { withButtonGroupType } from './config';
import { ButtonGroupOption } from './types';

type ButtonGroupProps = {
  options: readonly ButtonGroupOption[];
  label?: string;
  description?: string;
};

describe('ButtonGroupType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonGroupType, ReactiveFormsModule],
    }).compileComponents();
  });

  function createButtonGroup(
    value: unknown,
    props: ButtonGroupProps,
  ): {
    fixture: ComponentFixture<ButtonGroupType>;
    control: FormControl;
    toggles: Array<{ component: MatButtonToggle; element: HTMLElement }>;
  } {
    const fixture = TestBed.createComponent(ButtonGroupType);
    const control = new FormControl(value);

    fixture.componentRef.setInput('field', {
      id: 'button-group',
      props,
      formControl: control,
    } as unknown as FormlyFieldConfig);
    fixture.detectChanges();

    return {
      fixture,
      control,
      toggles: fixture.debugElement.queryAll(By.directive(MatButtonToggle)).map((debugElement) => ({
        component: debugElement.componentInstance as MatButtonToggle,
        element: debugElement.nativeElement as HTMLElement,
      })),
    };
  }

  it('registers the button-group Formly type', () => {
    expect(withButtonGroupType()).toEqual({
      types: [{ name: 'button-group', component: ButtonGroupType }],
    });
  });

  it('provides the Material form-field control contract', () => {
    const fixture = TestBed.createComponent(ButtonGroupType);
    const control = new FormControl('alpha');

    fixture.componentRef.setInput('field', {
      id: 'button-group',
      type: 'button-group',
      props: { options: [{ label: 'Alpha', value: 'alpha' }] },
      formControl: control,
    } as FormlyFieldConfig);
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('alpha');
    expect(fixture.componentInstance.empty).toBe(false);
    expect(fixture.componentInstance.controlType).toBeDefined();
  });

  it('binds a scalar value in single-selection mode', () => {
    const { fixture, control, toggles } = createButtonGroup('alpha', {
      label: 'Choices',
      options: [
        { label: 'Alpha', value: 'alpha' },
        { label: 'Beta', value: 'beta' },
      ],
    });

    expect(toggles[0].component.checked).toBe(true);

    toggles[1].element.querySelector('button')?.click();
    fixture.detectChanges();

    expect(control.value).toBe('beta');
  });

  it('applies disabled state to options and the field control', () => {
    const { fixture, control, toggles } = createButtonGroup(null, {
      options: [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled', disabled: true },
      ],
    });

    expect(toggles[0].component.disabled).toBe(false);
    expect(toggles[1].component.disabled).toBe(true);

    control.disable();
    fixture.detectChanges();

    expect(toggles.every(({ component }) => component.disabled)).toBe(true);
  });
});
