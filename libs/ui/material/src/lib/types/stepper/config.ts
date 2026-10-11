import { ConfigOption } from '@ngx-formly/core';
import { StepperType } from './stepper';

const defaultOptions = {
  props: {
    ariaLabel: 'Form steps',
    linear: false,
    orientation: 'horizontal' as const,
  },
};

export function withStepperType(): ConfigOption {
  return {
    types: [
      {
        name: 'stepper',
        component: StepperType,
        defaultOptions,
      },
    ],
  };
}
