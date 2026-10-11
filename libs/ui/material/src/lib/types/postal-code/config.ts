import { ConfigOption } from '@ngx-formly/core';
import { PostalCodeType } from './postal-code';

export function withPostalCodeType(): ConfigOption {
  return {
    types: [
      {
        name: 'postal-code',
        component: PostalCodeType,
        wrappers: ['form-field'],
      },
    ],
    validationMessages: [
      { name: 'postalCodeMask', message: 'Enter a complete postal code' },
      { name: 'postalCodePattern', message: 'Enter a valid postal code' },
    ],
  };
}
