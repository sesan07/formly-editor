import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Empty } from '../../empty';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { Filter } from '../../shared/filter';
import { CategoryPreset } from './category-preset';

@Component({
  selector: 'core-presets-tab-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MouseInsideService],
  imports: [Empty, Filter, CategoryPreset],
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

    @if (isFiltering() && !filteredVisibleFieldIds().length) {
      <core-empty
        label="No fields found"
        description="Try adjusting your filter criteria."
      />
    } @else {
      <ul class="content-list">
        @for (category of fieldCategoryPresets(); track category.displayName) {
          <li>
            <core-add-field-category-preset
              [category]="category"
              [isFiltering]="isFiltering()"
              [filteredVisibleFieldIds]="filteredVisibleFieldIds()"
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
export class PresetsTabContent {
  protected fieldService = inject(CoreFieldService);

  fieldCategoryPresets = this.fieldService.fieldCategoryPresets;

  readonly filterValue = signal('');
  readonly isFiltering = computed(() => !!this.filterValue());
  readonly filteredVisibleFieldIds = computed(
    () => {
      const query = this.filterValue().trim().toLowerCase();
      if (!query) {
        return [];
      }

      return this.fieldCategoryPresets()
        .flatMap((option) => option.children)
        .filter(
          (option) =>
            option.displayName.toLowerCase().includes(query) ||
            option.typeOption?.displayName.toLowerCase().includes(query),
        )
        .map((option) => option.id);
    },
    {
      equal: (a, b) => a.length === b.length && a.every((val, index) => val === b[index]),
    },
  );

  clearFilter() {
    this.filterValue.set('');
  }
}
