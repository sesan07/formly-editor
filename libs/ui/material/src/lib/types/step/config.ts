import { ConfigOption } from '@ngx-formly/core';
import { StepType } from './step';

export function withStepType(): ConfigOption {
  return {
    types: [{ name: 'step', component: StepType }],
  };
}
