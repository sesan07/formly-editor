import { ConfigOption } from '@ngx-formly/core';
import { withFormlyMaterial } from '@ngx-formly/material';
import { withFormlyFieldDatepicker } from '@ngx-formly/material/datepicker';
import { withFormlyFieldToggle } from '@ngx-formly/material/toggle';
import { ipAsyncValidator, ipValidator, ipValidatorMessage } from './material.utils';

export function materialConfigOptions(): ConfigOption[] {
  return [
    {
      validators: [
        { name: 'ip', validation: ipValidator },
        { name: 'ipAsync', validation: ipAsyncValidator },
      ],
      validationMessages: [
        { name: 'ip', message: ipValidatorMessage },
        { name: 'ipAsync', message: 'This is not a valid IP Address' },
        { name: 'required', message: 'This field is required' },
      ],
    },
    ...withFormlyMaterial(),
    withFormlyFieldDatepicker(),
    withFormlyFieldToggle(),
  ];
}
