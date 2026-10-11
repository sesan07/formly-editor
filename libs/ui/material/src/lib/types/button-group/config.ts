import { ConfigOption } from '@ngx-formly/core';
import { ButtonGroupType } from './button-group';

export function withButtonGroupType(): ConfigOption {
  return {
    types: [
      {
        name: 'button-group',
        component: ButtonGroupType,
      },
    ],
  };
}
