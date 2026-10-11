import { CoreFormService } from '../editor/core-form.service';
import { CoreFieldService } from '../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Empty, EmptyNoFieldSelected } from '../empty';
import { FieldPropertyList } from '../properties/field-property-list';
import { PropertyChange } from '../properties/types';
import { ActiveFieldChip } from '../shared/active-field-chip';
import { PanelHeader } from '../shared/panel-header';

@Component({
  selector: 'core-field-edit-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Empty, FieldPropertyList, EmptyNoFieldSelected, PanelHeader, ActiveFieldChip],
  host: {
    class: 'overflow-hidden',
  },
  template: `
    <core-panel-header
      header="Field Edit"
      subHeader="Edit the selected field's properties"
    >
      <ng-container headerChip>
        <core-active-field-chip />
      </ng-container>
    </core-panel-header>
    @if (activeField(); as field) {
      @if (properties().length) {
        <core-field-property-list
          [properties]="properties()"
          [target]="field"
          (targetChanged)="onFieldChanged($event)"
        />
      } @else {
        <core-empty
          label="No editable properties"
          description="This field has no editable properties."
        />
      }
    } @else {
      <core-empty-no-field-selected />
    }
  `,
})
export class FieldEditPanel {
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);

  activeField = this.formService.activeField;
  activeFieldMap = this.formService.activeFieldMap;
  readonly headerTitle = computed(() => {
    const activeField = this.activeField();
    if (!activeField) {
      return 'Field Edit';
    }

    return `Field Edit - ${this.fieldService.getKey(activeField) || activeField._info.name}`;
  });
  readonly parentField = computed(() => {
    const field = this.activeField();
    if (!field) {
      return null;
    }
    const parentId = field._info.idPath[field._info.idPath.length - 2];
    return this.activeFieldMap()[parentId] || null;
  });

  // Only emits when the field type or wrappers change
  readonly activeFieldByType = computed(() => this.activeField(), {
    equal: (a, b) => !!(a && b && this.fieldService.isFieldEqual(a, b)),
  });

  readonly properties = computed(() => {
    const field = this.activeFieldByType();
    return field ? this.fieldService.getProperties(field) : [];
  });

  readonly keyPath = computed(() => {
    const activeField = this.formService.activeField();
    if (!activeField) return '';

    return this.fieldService.getKey(activeField);
  });

  onFieldChanged(change: PropertyChange): void {
    this.formService.modifyActiveField(change);
  }
}
