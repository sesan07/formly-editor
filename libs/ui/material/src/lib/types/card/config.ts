import { ConfigOption } from '@ngx-formly/core';

export function withCardType(): ConfigOption {
  return {
    types: [
      {
        name: 'card',
        extends: 'formly-group',
        wrappers: ['card'],
      },
    ],
  };
}
