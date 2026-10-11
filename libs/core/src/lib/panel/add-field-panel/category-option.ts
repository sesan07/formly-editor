import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldCategoryOption } from '../../config/types';
import { TypeOption } from './type-option';

@Component({
  selector: 'core-add-field-category-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeOption],
  template: `
    <h3 class="flex items-center font-medium">
      {{ category().displayName }}
    </h3>
    <ul class="mt-2 flex flex-col gap-2">
      @for (type of category().children; track type.displayName) {
        <li [class.hidden]="isFiltering() && !filteredVisibleFieldNames().includes(type.name)">
          <core-add-field-type-option [type]="type" />
        </li>
      }
    </ul>
  `,
})
export class CategoryOption {
  readonly category = input.required<FieldCategoryOption>();
  readonly isFiltering = input(false, { transform: booleanAttribute });
  readonly filteredVisibleFieldNames = input.required<string[]>();
}
