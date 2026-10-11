import { booleanAttribute, Directive, forwardRef, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { JSONValidationError } from './types';

@Directive({
  selector: '[coreJsonArray]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JSONArrayValidator),
      multi: true,
    },
  ],
})
export class JSONArrayValidator implements Validator {
  readonly enabled = input(true, { transform: booleanAttribute, alias: 'coreJsonArray' });

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.enabled() && control.value) {
      return control.value[0] !== '[' ? { jsonArray: this.getValidationErrors() } : null;
    }
    return null;
  }

  getValidationErrors(): JSONValidationError[] {
    return [
      {
        label: 'Array Root',
        messages: ['JSON root must be an array'],
      },
    ];
  }
}
