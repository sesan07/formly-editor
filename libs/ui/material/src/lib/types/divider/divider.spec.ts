import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { By } from '@angular/platform-browser';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DividerType } from './divider';
import { withDividerType } from './config';

describe('DividerType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerType, ReactiveFormsModule],
    }).compileComponents();
  });

  function createDivider(props: Record<string, unknown> = {}): ComponentFixture<DividerType> {
    const fixture = TestBed.createComponent(DividerType);

    fixture.componentRef.setInput('field', {
      id: 'divider',
      type: 'divider',
      props,
      formControl: new FormControl(),
    } as FormlyFieldConfig);
    fixture.detectChanges();

    return fixture;
  }

  it('registers the divider Formly type', () => {
    expect(withDividerType()).toEqual({
      types: [{ name: 'divider', component: DividerType }],
    });
  });

  it('renders a horizontal non-inset Material separator by default', () => {
    const fixture = createDivider();
    const element = fixture.nativeElement.querySelector('mat-divider');
    const divider = fixture.debugElement.query(By.directive(MatDivider))
      .componentInstance as MatDivider;

    expect(element.getAttribute('role')).toBe('separator');
    expect(divider.vertical).toBe(false);
    expect(divider.inset).toBe(false);
  });

  it('passes vertical and inset props to Material', () => {
    const fixture = createDivider({ vertical: true, inset: true });
    const divider = fixture.debugElement.query(By.directive(MatDivider))
      .componentInstance as MatDivider;

    expect(divider.vertical).toBe(true);
    expect(divider.inset).toBe(true);
  });
});
