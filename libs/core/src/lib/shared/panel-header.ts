import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'core-panel-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <div
      class="flex min-h-(--panel-header-height) shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2"
    >
      <div class="flex grow flex-col">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-lg font-medium">{{ header() }}</h2>
          <ng-content select="[headerChip]" />
        </div>
        <span class="text-sm text-muted-color">{{ subHeader() }}</span>
      </div>
      <span class="inline-flex items-center gap-2">
        <ng-content select="[actions]" />
      </span>
    </div>
  `,
})
export class PanelHeader {
  readonly header = input.required<string>();
  readonly subHeader = input.required<string>();
}
