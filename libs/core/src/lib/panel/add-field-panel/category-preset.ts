import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldCategoryPreset } from '../../config/types';
import { TypePreset } from './type-preset';

@Component({
  selector: 'core-add-field-category-preset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypePreset],
  template: `
    <h3 class="flex items-center font-medium">
      {{ category().displayName }}
    </h3>
    <ul class="mt-2 flex flex-col gap-2">
      @for (preset of category().children; track preset.displayName) {
        <li [class.hidden]="isFiltering() && !filteredVisibleFieldIds().includes(preset.id)">
          <core-add-field-type-preset [preset]="preset" />
        </li>
      }
    </ul>
  `,
})
export class CategoryPreset {
  readonly category = input.required<FieldCategoryPreset>();
  readonly isFiltering = input(false, { transform: booleanAttribute });
  readonly filteredVisibleFieldIds = input.required<string[]>();
}
