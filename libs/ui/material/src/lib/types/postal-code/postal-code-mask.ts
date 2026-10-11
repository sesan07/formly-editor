import { Directive, ElementRef, forwardRef, inject, input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

const MASK_TOKENS = {
  '0': /[0-9]/,
  A: /[A-Z]/i,
  '*': /[A-Z0-9]/i,
} as const;

type MaskToken = keyof typeof MASK_TOKENS;

function isMaskToken(character: string): character is MaskToken {
  return character in MASK_TOKENS;
}

export function rawPostalCode(value: unknown, uppercase = true): string {
  const normalizedValue = uppercase ? String(value ?? '').toUpperCase() : String(value ?? '');
  return normalizedValue.replace(/[^A-Z0-9]/gi, '');
}

export function formatPostalCode(value: unknown, mask: string, uppercase = true): string {
  const source = rawPostalCode(value, uppercase);
  if (!mask) {
    return source;
  }

  let sourceIndex = 0;
  let formattedValue = '';

  for (const maskCharacter of mask) {
    if (!isMaskToken(maskCharacter)) {
      if (sourceIndex > 0 && sourceIndex < source.length) {
        formattedValue += maskCharacter;
      }
      continue;
    }

    while (sourceIndex < source.length) {
      const sourceCharacter = source[sourceIndex++];
      if (MASK_TOKENS[maskCharacter].test(sourceCharacter)) {
        formattedValue += sourceCharacter;
        break;
      }
    }
  }

  return formattedValue;
}

export function isPostalCodeMaskComplete(value: unknown, mask: string, uppercase = true): boolean {
  if (!mask || value == null || value === '') {
    return true;
  }

  return formatPostalCode(value, mask, uppercase).length === mask.length;
}

@Directive({
  selector: 'input[libPostalCodeMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PostalCodeMaskDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PostalCodeMaskDirective),
      multi: true,
    },
  ],
  host: {
    '(blur)': 'handleBlur()',
    '(compositionend)': 'handleCompositionEnd($event)',
    '(compositionstart)': 'handleCompositionStart()',
    '(input)': 'handleInput($event)',
  },
})
export class PostalCodeMaskDirective implements ControlValueAccessor, OnChanges, Validator {
  readonly mask = input('');
  readonly storeRawValue = input(false);
  readonly autoCapitalize = input(true);
  readonly postalCodePattern = input<string>();

  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private composing = false;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.element.nativeElement.value = formatPostalCode(value, this.mask(), this.autoCapitalize());
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  registerOnValidatorChange(onValidatorChange: () => void): void {
    this.onValidatorChange = onValidatorChange;
  }

  ngOnChanges(): void {
    this.onValidatorChange();
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.nativeElement.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value == null || value === '') {
      return null;
    }

    const mask = this.mask();
    const uppercase = this.autoCapitalize();
    const formattedValue = formatPostalCode(value, mask, uppercase);
    if (!isPostalCodeMaskComplete(value, mask, uppercase)) {
      return { postalCodeMask: true };
    }

    const pattern = this.postalCodePattern();
    if (!pattern) {
      return null;
    }

    try {
      return new RegExp(pattern).test(formattedValue) ? null : { postalCodePattern: true };
    } catch {
      return { postalCodePattern: true };
    }
  }

  handleInput(event: Event): void {
    if (this.composing) {
      return;
    }

    this.commit((event.target as HTMLInputElement).value);
  }

  handleCompositionStart(): void {
    this.composing = true;
  }

  handleCompositionEnd(event: CompositionEvent): void {
    this.composing = false;
    this.commit((event.target as HTMLInputElement).value);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private commit(value: string): void {
    const uppercase = this.autoCapitalize();
    const formattedValue = formatPostalCode(value, this.mask(), uppercase);
    this.element.nativeElement.value = formattedValue;
    this.onChange(this.storeRawValue() ? rawPostalCode(formattedValue, uppercase) : formattedValue);
  }
}
