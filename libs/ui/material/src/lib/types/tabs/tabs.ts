import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldGroupTypeConfig, FieldType } from '@ngx-formly/core';
import { TabsContent } from './tabs-content';
import { TabsProps } from './types';

@Component({
  selector: 'lib-tabs-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TabsContent],
  template: `
    <lib-tabs-content
      [field]="field"
      [props]="props"
    />
  `,
})
export class TabsType extends FieldType<FieldGroupTypeConfig<TabsProps>> {}
