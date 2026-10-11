import { ConfigOption } from '@ngx-formly/core';
import { MarkdownType } from './markdown';

export function withMarkdownType(): ConfigOption {
  return {
    types: [
      {
        name: 'markdown',
        component: MarkdownType,
      },
    ],
  };
}
