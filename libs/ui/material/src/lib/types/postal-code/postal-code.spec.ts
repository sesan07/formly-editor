import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { PostalCodeType } from './postal-code';
import { formatPostalCode, rawPostalCode } from './postal-code-mask';
import { withPostalCodeType } from './config';
import { PostalCodeProps } from './types';

describe('PostalCodeType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostalCodeType, ReactiveFormsModule],
    }).compileComponents();
  });

  function createPostalCode(
    value: string,
    props: PostalCodeProps,
  ): { fixture: ComponentFixture<PostalCodeType>; control: FormControl; input: HTMLInputElement } {
    const fixture = TestBed.createComponent(PostalCodeType);
    const control = new FormControl(value);

    fixture.componentRef.setInput('field', {
      id: 'postal-code',
      type: 'postal-code',
      props,
      formControl: control,
      options: { showError: () => false },
    } as FormlyFieldConfig);
    fixture.detectChanges();

    return {
      fixture,
      control,
      input: fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement,
    };
  }

  it('registers the postal-code Formly type and validation messages', () => {
    const config = withPostalCodeType();

    expect(config.types).toEqual([
      { name: 'postal-code', component: PostalCodeType, wrappers: ['form-field'] },
    ]);
    expect(config.validationMessages?.map(({ name }) => name)).toEqual([
      'postalCodeMask',
      'postalCodePattern',
    ]);
  });

  it('formats and normalizes fixed masks', () => {
    expect(formatPostalCode('k1a0b1', 'A0A 0A0')).toBe('K1A 0B1');
    expect(formatPostalCode('k1a0b1', 'A0A 0A0', false)).toBe('k1a 0b1');
    expect(formatPostalCode('12x34-5', '00000')).toBe('12345');
    expect(rawPostalCode('K1A 0B1')).toBe('K1A0B1');
  });

  it('stores formatted uppercase values by default', () => {
    const { control, input } = createPostalCode('', {
      mask: 'A0A 0A0',
      postalCodePattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$',
    });

    input.value = 'k1a0b1';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('K1A 0B1');
    expect(control.value).toBe('K1A 0B1');
    expect(control.valid).toBe(true);
  });

  it('formats raw model values on read and stores raw values on input', () => {
    const { control, input } = createPostalCode('K1A0B1', {
      mask: 'A0A 0A0',
      postalCodePattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$',
      storeRawValue: true,
    });

    expect(input.value).toBe('K1A 0B1');
    expect(control.valid).toBe(true);

    input.value = 'h0h 0h0';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('H0H 0H0');
    expect(control.value).toBe('H0H0H0');
  });

  it('applies postal input attributes and validates incomplete masks', () => {
    const { control, input } = createPostalCode('1234', {
      autocompleteContext: 'shipping',
      autoCapitalize: false,
      inputMode: 'numeric',
      mask: '00000',
    });

    expect(input.inputMode).toBe('numeric');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(input.autocomplete).toBe('shipping postal-code');
    expect(control.hasError('postalCodeMask')).toBe(true);

    control.setValue('12345');
    expect(input.value).toBe('12345');
    expect(control.valid).toBe(true);
  });

  it('preserves case when auto-capitalization is disabled', () => {
    const { control, input } = createPostalCode('', {
      autoCapitalize: false,
      mask: 'A0A 0A0',
    });

    input.value = 'k1a0b1';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('k1a 0b1');
    expect(control.value).toBe('k1a 0b1');
  });

  it('defers formatting during composition and supports partial deletion', () => {
    const { control, input } = createPostalCode('', { mask: 'A0A 0A0' });

    input.dispatchEvent(new CompositionEvent('compositionstart'));
    input.value = 'k1a0';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('');

    input.dispatchEvent(new CompositionEvent('compositionend'));
    expect(control.value).toBe('K1A 0');

    input.value = 'K1A';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('K1A');
    expect(control.value).toBe('K1A');
  });

  it('propagates disabled and touched state', () => {
    const { control, input } = createPostalCode('', { mask: '00000' });

    control.disable();
    expect(input.disabled).toBe(true);

    input.dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
  });
});
