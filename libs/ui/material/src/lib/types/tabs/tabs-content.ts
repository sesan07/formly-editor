import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FormlyField, FormlyFieldConfig } from '@ngx-formly/core';
import { TabProps } from '../tab/types';
import { TabsProps } from './types';

@Component({
  selector: 'lib-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyField, MatTab, MatTabGroup],
  template: `
    @if (hasInvalidChildren || visibleTabs.length === 0) {
      <div
        style="display: flex; justify-content: center; align-items: center; font: var(--mat-sys-body-large); width: 100%; padding: 16px;"
      >
        @if (hasInvalidChildren) {
          <p>Tabs children must use the Tab field type</p>
        } @else if (visibleTabs.length === 0) {
          <p>Add a Tab to get started</p>
        }
      </div>
    } @else {
      <mat-tab-group
        [dynamicHeight]="props().dynamicHeight ?? false"
        [headerPosition]="props().headerPosition ?? 'above'"
        [mat-align-tabs]="props().alignTabs ?? 'start'"
        [mat-stretch-tabs]="!(props().disableStretchTabs ?? false)"
        [fitInkBarToContent]="props().fitInkBarToContent ?? false"
        [preserveContent]="props().preserveContent ?? true"
        [selectedIndex]="boundedSelectedIndex"
        (selectedIndexChange)="selectedIndex.set($event)"
      >
        @for (tab of visibleTabs; track tab) {
          <mat-tab
            [label]="tabLabel(tab, $index)"
            [disabled]="tab.props?.disabled ?? false"
          >
            <formly-field [field]="tab" />
          </mat-tab>
        }
      </mat-tab-group>
    }
  `,
})
export class TabsContent {
  readonly field = input.required<FormlyFieldConfig>();
  readonly props = input.required<TabsProps>();
  readonly selectedIndex = model(0);

  get hasInvalidChildren(): boolean {
    return (this.field().fieldGroup ?? []).some((child) => child.type !== 'tab');
  }

  get visibleTabs(): readonly FormlyFieldConfig<TabProps>[] {
    return (this.field().fieldGroup ?? []).filter((tab) => tab.type === 'tab' && tab.hide !== true);
  }

  get boundedSelectedIndex(): number {
    const lastIndex = Math.max(this.visibleTabs.length - 1, 0);
    return Math.min(Math.max(this.selectedIndex(), 0), lastIndex);
  }

  tabLabel(tab: FormlyFieldConfig<TabProps>, index: number): string {
    return tab.props?.label || `Tab ${index + 1}`;
  }
}
