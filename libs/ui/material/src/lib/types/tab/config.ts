import { ConfigOption } from '@ngx-formly/core';
import { TabType } from './tab';

export function withTabType(): ConfigOption {
  return {
    types: [{ name: 'tab', component: TabType }],
  };
}
