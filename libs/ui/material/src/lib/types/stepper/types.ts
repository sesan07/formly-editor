import type { StepperOrientation } from '@angular/material/stepper';

export interface StepperProps {
  linear?: boolean;
  orientation?: StepperOrientation;
  ariaLabel?: string;
}
