import { ConfigOption } from '@ngx-formly/core';
import { RepeatingSectionType } from './repeating-section';

export function withRepeatingSectionType(): ConfigOption {
  return {
    types: [
      {
        name: 'repeating-section',
        component: RepeatingSectionType,
        defaultOptions: {
          props: {
            addText: 'Add Section',
          },
        },
      },
    ],
  };
}
