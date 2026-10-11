import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldGroupTypeConfig, FieldType } from '@ngx-formly/core';
import { StepperContent } from './stepper-content';
import { StepperProps } from './types';

@Component({
  selector: 'lib-stepper-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepperContent],
  template: `
    <lib-stepper-content
      [field]="field"
      [props]="props"
    />
  `,
})
export class StepperType extends FieldType<FieldGroupTypeConfig<StepperProps>> {}
