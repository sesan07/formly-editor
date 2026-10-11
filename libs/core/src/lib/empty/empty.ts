import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'core-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center justify-center p-6 gap-4 text-center',
  },
  template: `
    <div class="flex justify-center">
      <i class="material-symbols-outlined">box</i>
    </div>

    <div>
      <div class="text-lg font-medium">{{ label() || 'Nothing here yet' }}</div>
      <div class="text-sm">
        {{ description() || 'Create or select an item to get started.' }}
      </div>
    </div>

    <ng-content />
  `,
})
export class Empty {
  readonly label = input('');
  readonly description = input('');
}
