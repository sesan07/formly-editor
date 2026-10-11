import { withTabsType } from '@formly-editor/material';
import { ConfigOption } from '@ngx-formly/core';
import { TabsTypeBuilder } from './tabs.builder';

export function withTabsTypeBuilder(): ConfigOption {
  const config = withTabsType();
  return {
    ...config,
    types: config.types?.map((type) => ({ ...type, component: TabsTypeBuilder })),
  };
}
