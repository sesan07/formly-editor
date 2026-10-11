import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { JSONValidationError } from './types';

@Directive({
  selector: '[coreJsonFormat]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JSONFormatValidator),
      multi: true,
    },
  ],
})
export class JSONFormatValidator implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      try {
        JSON.parse(control.value);
        return null;
      } catch {
        return { jsonFormat: this.getValidationErrors() };
      }
    }

    return null;
  }

  getValidationErrors(): JSONValidationError[] {
    return [
      {
        label: 'Format',
        messages: ['JSON format is not valid'],
      },
    ];
  }
}
