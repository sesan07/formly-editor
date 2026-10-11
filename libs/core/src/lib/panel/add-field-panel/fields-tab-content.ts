import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Empty } from '../../empty';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { Filter } from '../../shared/filter';
import { CategoryOption } from './category-option';

@Component({
  selector: 'core-fields-tab-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MouseInsideService],
  imports: [Empty, Filter, CategoryOption],
  host: {
    class: 'add-field-tab-content',
  },
  template: `
    <div class="min-h-(--sub-panel-header-height) shrink-0 px-4">
      <core-filter
        [(value)]="filterValue"
        (clear)="clearFilter()"
      />
    </div>

    @if (isFiltering() && !filteredVisibleFieldNames().length) {
      <core-empty
        label="No fields found"
        description="Try adjusting your filter criteria."
      />
    } @else {
      <ul class="content-list">
        @for (category of fieldCategoryOptions(); track category.displayName) {
          <li>
            <core-add-field-category-option
              [category]="category"
              [isFiltering]="isFiltering()"
              [filteredVisibleFieldNames]="filteredVisibleFieldNames()"
            />
          </li>
        } @empty {
          <li>
            <core-empty
              label="No Field Configured"
              description="There are no field categories configured. Please check your setup."
            />
          </li>
        }
      </ul>
    }
  `,
})
export class FieldsTabContent {
  protected fieldService = inject(CoreFieldService);

  readonly fieldCategoryOptions = computed(() => [
    ...this.fieldService.activeFieldCategoryOptions(),
    { displayName: 'Misc', children: [this.fieldService.defaultTypeOption] },
  ]);

  readonly fieldTypeOptions = computed(() => [
    ...this.fieldService.activeFieldTypeOptions(),
    this.fieldService.defaultTypeOption,
  ]);

  readonly filterValue = signal('');
  readonly isFiltering = computed(() => !!this.filterValue());
  readonly filteredVisibleFieldNames = computed(
    () => {
      const query = this.filterValue().trim().toLowerCase();
      if (!query) {
        return [];
      }

      return this.fieldTypeOptions()
        .filter((option) => option.displayName.toLowerCase().includes(query))
        .map((option) => option.name);
    },
    {
      equal: (a, b) => a.length === b.length && a.every((val, index) => val === b[index]),
    },
  );

  clearFilter() {
    this.filterValue.set('');
  }
}
