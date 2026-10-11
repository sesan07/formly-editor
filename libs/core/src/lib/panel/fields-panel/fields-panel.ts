import { CoreFormService } from '../../editor/core-form.service';
import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { get } from 'lodash-es';
import { Empty } from '../../empty';
import { EmptyNoField } from '../../empty/empty-no-field';
import { EmptyNoForm } from '../../empty/empty-no-form';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { PanelService } from '../../editor/panel.service';
import { ActiveFieldChip } from '../../shared/active-field-chip';
import { Filter } from '../../shared/filter';
import { PanelHeader } from '../../shared/panel-header';
import { FieldItem } from './field-item';

@Component({
  selector: 'core-fields-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MouseInsideService],
  imports: [FieldItem, EmptyNoForm, EmptyNoField, Empty, Filter, PanelHeader, ActiveFieldChip],
  host: {
    class: 'overflow-hidden h-full block',
  },
  template: `
    <core-panel-header
      header="Fields"
      subHeader="Browse and filter fields in the active form"
    >
      <ng-container headerChip>
        <core-active-field-chip />
      </ng-container>
    </core-panel-header>

    @if (activeFormId()) {
      @if (rootFieldIds().length) {
        <div class="flex min-h-0 flex-1 flex-col">
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
          }

          <ul
            class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4"
            (mouseenter)="setMouseInside(true)"
            (mouseleave)="setMouseInside(false)"
          >
            @for (fieldId of rootFieldIds(); track fieldId) {
              <li [class.hidden]="isFiltering() && !filteredVisibleFieldIds().includes(fieldId)">
                <core-panel-field-item
                  [fieldId]="fieldId"
                  [isTabRoot]="$first"
                  [isFiltering]="isFiltering()"
                  [filteredVisibleFieldIds]="filteredVisibleFieldIds()"
                />
              </li>
            }
          </ul>
        </div>
      } @else {
        <core-empty-no-field />
      }
    } @else {
      <core-empty-no-form />
    }
  `,
})
export class FieldsPanel {
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);
  protected panelService = inject(PanelService);
  protected mouseInsideService = inject(MouseInsideService);

  readonly filterValue = signal('');
  readonly isFiltering = computed(() => !!this.filterValue());
  readonly filteredVisibleFieldIds = computed(
    () => {
      const query = this.filterValue().trim().toLowerCase();
      if (!query) {
        return [];
      }

      const fields = Object.values(this.formService.activeFieldMap());
      const visibleFieldIds = new Set<string>();

      fields
        .filter((field) =>
          this.fieldService.filterPaths.some((path) =>
            String(get(field, path) ?? '')
              .toLowerCase()
              .includes(query),
          ),
        )
        .forEach((field) => field._info.idPath.forEach((id) => visibleFieldIds.add(id)));

      return Array.from(visibleFieldIds);
    },
    {
      equal: (a, b) => a.length === b.length && a.every((val, index) => val === b[index]),
    },
  );

  activeFormId = this.formService.activeFormId;
  rootFieldIds = this.formService.activeRootFieldIds;

  openFormsPanel() {
    this.panelService.setActiveLHSPanel('forms');
  }

  setMouseInside(isInside: boolean) {
    this.mouseInsideService.setMouseInside(isInside);
  }

  clearFilter() {
    this.filterValue.set('');
  }
}
