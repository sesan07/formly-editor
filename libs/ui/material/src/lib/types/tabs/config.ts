import { ConfigOption } from '@ngx-formly/core';
import { TabsType } from './tabs';

export function withTabsType(): ConfigOption {
  return {
    types: [
      {
        name: 'tabs',
        component: TabsType,
      },
    ],
  };
}
