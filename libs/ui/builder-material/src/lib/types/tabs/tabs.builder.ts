import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { BuilderFieldStateService } from '@formly-editor/core';
import { TabsContent, TabsProps } from '@formly-editor/material';
import { FieldGroupTypeConfig, FieldType } from '@ngx-formly/core';

interface State {
  selectedIndex?: number;
}

@Component({
  selector: 'lib-tabs-type-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TabsContent],
  template: `
    <lib-tabs-content
      [field]="field"
      [props]="props"
      [selectedIndex]="selectedIndex()"
      (selectedIndexChange)="setSelectedIndex($event)"
    />
  `,
})
export class TabsTypeBuilder extends FieldType<FieldGroupTypeConfig<TabsProps>> implements OnInit {
  private readonly fieldStateService = inject(BuilderFieldStateService);
  private state: State | undefined;
  readonly selectedIndex = signal(0);

  ngOnInit(): void {
    this.state = this.fieldStateService.getState<State>(this.field);
    this.setSelectedIndex(this.state?.selectedIndex ?? 0);
  }

  setSelectedIndex(index: number): void {
    const count = (this.field.fieldGroup ?? []).filter(
      (child) => child.type === 'tab' && child.hide !== true,
    ).length;
    const selectedIndex = Number.isFinite(index)
      ? Math.min(Math.max(Math.trunc(index), 0), Math.max(count - 1, 0))
      : 0;
    this.selectedIndex.set(selectedIndex);
    this.state = { ...this.state, selectedIndex };
    this.fieldStateService.setState(this.field, this.state);
  }
}
