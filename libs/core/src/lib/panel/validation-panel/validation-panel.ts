import { CoreFormService } from '../../editor/core-form.service';
import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Empty, EmptyNoFieldSelected } from '../../empty';
import { PropertyChange } from '../../properties/types';
import { ActiveFieldChip } from '../../shared/active-field-chip';
import { PanelHeader } from '../../shared/panel-header';
import { ValidationPanelContent } from './validation-panel-content';

@Component({
  selector: 'core-validation-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Empty, EmptyNoFieldSelected, ValidationPanelContent, ActiveFieldChip, PanelHeader],
  host: { class: 'overflow-hidden' },
  template: `
    <core-panel-header
      header="Validation"
      subHeader="Configure validation for the selected field"
    >
      <ng-container headerChip>
        <core-active-field-chip />
      </ng-container>
    </core-panel-header>
    @if (activeField(); as field) {
      @if (config(); as validationConfig) {
        <core-validation-panel-content
          [config]="validationConfig"
          [target]="field"
          (targetChanged)="onFieldChanged($event)"
        />
      } @else {
        <core-empty
          label="No validation options"
          description="This field type has no configurable validation options."
        />
      }
    } @else {
      <core-empty-no-field-selected />
    }
  `,
})
export class ValidationPanel {
  private readonly formService = inject(CoreFormService);
  private readonly fieldService = inject(CoreFieldService);

  protected readonly activeField = this.formService.activeField;
  private readonly activeFieldByType = computed(() => this.activeField(), {
    equal: (a, b) => !!(a && b && this.fieldService.isFieldEqual(a, b)),
  });
  protected readonly config = computed(() => {
    const field = this.activeFieldByType();
    return field ? this.fieldService.getValidationConfig(field) : undefined;
  });

  protected onFieldChanged(change: PropertyChange): void {
    this.formService.modifyActiveField(change);
  }
}
