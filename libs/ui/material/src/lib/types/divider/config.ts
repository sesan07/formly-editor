import { ConfigOption } from '@ngx-formly/core';
import { DividerType } from './divider';

export function withDividerType(): ConfigOption {
  return {
    types: [
      {
        name: 'divider',
        component: DividerType,
      },
    ],
  };
}
