import { ConfigOption } from '@ngx-formly/core';
import { CardWrapper } from './card';

export function withCardWrapper(): ConfigOption {
  return {
    wrappers: [
      {
        name: 'card',
        component: CardWrapper,
      },
    ],
  };
}
