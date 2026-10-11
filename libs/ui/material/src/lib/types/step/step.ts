import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { FieldGroupTypeConfig, FieldType, FormlyField } from '@ngx-formly/core';
import { StepProps } from './types';

@Component({
  selector: 'lib-step-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyField, MatButton, MatStepperNext, MatStepperPrevious],
  template: `
    @if (!isInsideStepper) {
      <div
        style="display: flex; justify-content: center; align-items: center; font: var(--mat-sys-body-large); width: 100%; padding: 16px;"
      >
        <p>Step field must be placed directly inside a Stepper</p>
      </div>
    } @else {
      @if (field.fieldGroup?.length) {
        <div [class]="field.fieldGroupClassName || ''">
          @for (child of field.fieldGroup; track child) {
            <formly-field [field]="child" />
          }
        </div>
      } @else {
        <div
          style="display: flex; justify-content: center; align-items: center; font: var(--mat-sys-body-large); width: 100%; padding: 16px;"
        >
          <p>Add any field to this step</p>
        </div>
      }

      @if (!isFirstVisibleStep) {
        <button
          mat-button
          matStepperPrevious
          type="button"
        >
          {{ props.previousButtonLabel || 'Back' }}
        </button>
      }
      @if (!isLastVisibleStep) {
        <button
          mat-button
          matStepperNext
          type="button"
          (click)="$event.preventDefault()"
        >
          {{ props.nextButtonLabel || 'Next' }}
        </button>
      }
    }
  `,
})
export class StepType extends FieldType<FieldGroupTypeConfig<StepProps>> {
  get isInsideStepper(): boolean {
    return this.field.parent?.type === 'stepper';
  }

  get isFirstVisibleStep(): boolean {
    return this.visibleSiblingSteps[0] === this.field;
  }

  get isLastVisibleStep(): boolean {
    return this.visibleSiblingSteps.at(-1) === this.field;
  }

  private get visibleSiblingSteps() {
    return (this.field.parent?.fieldGroup ?? []).filter(
      (sibling) => sibling.type === 'step' && sibling.hide !== true,
    );
  }
}
