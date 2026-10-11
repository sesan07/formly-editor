import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldGroupTypeConfig, FieldType, FormlyField } from '@ngx-formly/core';
import { TabProps } from './types';

@Component({
  selector: 'lib-tab-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyField],
  template: `
    @if (!isInsideTabs) {
      <div
        style="display: flex; justify-content: center; align-items: center; font: var(--mat-sys-body-large); width: 100%; padding: 16px;"
      >
        <p>Tab field must be placed directly inside Tabs</p>
      </div>
    } @else if (field.fieldGroup?.length) {
      <div [class]="field.fieldGroupClassName || ''">
        @for (child of field.fieldGroup; track child) {
          <formly-field [field]="child" />
        }
      </div>
    } @else {
      <div
        style="display: flex; justify-content: center; align-items: center; font: var(--mat-sys-body-large); width: 100%; padding: 16px;"
      >
        <p>Add any field to this tab</p>
      </div>
    }
  `,
})
export class TabType extends FieldType<FieldGroupTypeConfig<TabProps>> {
  get isInsideTabs(): boolean {
    return this.field.parent?.type === 'tabs';
  }
}
