import type { FormlyFieldProps } from '@ngx-formly/material/form-field';

export type PostalCodeInputMode = 'numeric' | 'text';
export type PostalCodeAutocompleteContext = 'billing' | 'shipping' | 'unscoped';

export interface PostalCodeProps extends FormlyFieldProps {
  mask?: string;
  storeRawValue?: boolean;
  inputMode?: PostalCodeInputMode;
  autoCapitalize?: boolean;
  autocompleteContext?: PostalCodeAutocompleteContext;
  postalCodePattern?: string;
}
