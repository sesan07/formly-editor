import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatStep, MatStepLabel, MatStepper } from '@angular/material/stepper';
import { FormlyField, FormlyFieldConfig } from '@ngx-formly/core';
import { StepProps } from '../step/types';
import { StepperProps } from './types';

@Component({
  selector: 'lib-stepper-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyField, MatStep, MatStepLabel, MatStepper],
  template: `
    @if (hasInvalidChildren || visibleSteps.length === 0) {
      <div
        style="display: flex; justify-content: center; align-items: center; font: var(--mat-sys-body-large); width: 100%; padding: 16px;"
      >
        @if (hasInvalidChildren) {
          <p>Stepper children must use the Step field type</p>
        } @else if (visibleSteps.length === 0) {
          <p>Add a Step to get started</p>
        }
      </div>
    } @else {
      <mat-stepper
        [linear]="props().linear ?? false"
        [orientation]="props().orientation ?? 'horizontal'"
        [selectedIndex]="boundedSelectedIndex"
        [attr.aria-label]="props().ariaLabel || 'Form steps'"
        (selectedIndexChange)="selectedIndex.set($event)"
      >
        @for (step of visibleSteps; track step) {
          <mat-step
            [completed]="isStepValid(step)"
            [optional]="step.props?.optional ?? false"
            [editable]="step.props?.disableEdit !== true"
          >
            <ng-template matStepLabel>{{ stepLabel(step, $index) }}</ng-template>
            <formly-field [field]="step" />
          </mat-step>
        }
      </mat-stepper>
    }
  `,
})
export class StepperContent {
  readonly field = input.required<FormlyFieldConfig>();
  readonly props = input.required<StepperProps>();
  readonly selectedIndex = model(0);

  get hasInvalidChildren(): boolean {
    return (this.field().fieldGroup ?? []).some((child) => child.type !== 'step');
  }

  get visibleSteps(): readonly FormlyFieldConfig<StepProps>[] {
    return (this.field().fieldGroup ?? []).filter(
      (step) => step.type === 'step' && step.hide !== true,
    );
  }

  get boundedSelectedIndex(): number {
    const lastIndex = Math.max(this.visibleSteps.length - 1, 0);
    return Math.min(Math.max(this.selectedIndex(), 0), lastIndex);
  }

  isStepValid(step: FormlyFieldConfig): boolean {
    if (step.hide === true) {
      return true;
    }

    if (step.fieldGroup) {
      return step.fieldGroup.every((child) => this.isStepValid(child));
    }

    return step.formControl?.valid ?? true;
  }

  stepLabel(step: FormlyFieldConfig<StepProps>, index: number): string {
    return step.props?.label || `Step ${index + 1}`;
  }
}
