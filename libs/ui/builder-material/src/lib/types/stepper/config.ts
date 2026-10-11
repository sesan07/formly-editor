import { withStepperType } from '@formly-editor/material';
import { ConfigOption } from '@ngx-formly/core';
import { StepperTypeBuilder } from './stepper.builder';

export function withStepperTypeBuilder(): ConfigOption {
  const config = withStepperType();
  return {
    ...config,
    types: config.types?.map((type) => ({ ...type, component: StepperTypeBuilder })),
  };
}
