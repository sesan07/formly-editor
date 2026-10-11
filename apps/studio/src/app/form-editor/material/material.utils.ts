import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

const validateIp = (control: AbstractControl, name: string) =>
  /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : { [name]: true };

export const ipValidator = (control: AbstractControl) => validateIp(control, 'ip');
export const ipAsyncValidator = (control: AbstractControl) => of(validateIp(control, 'ipAsync'));

export const ipValidatorMessage = (error: unknown, field: FormlyFieldConfig) =>
  `"${field.formControl?.value}" is not a valid IP Address`;
