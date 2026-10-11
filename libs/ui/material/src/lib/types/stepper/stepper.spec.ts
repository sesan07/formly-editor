import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyForm,
  provideFormlyCore,
} from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { withStepType } from '../step/config';
import { withStepperType } from './config';
import { StepperType } from './stepper';

@Component({
  selector: 'lib-test-input-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="formControl" />`,
})
class TestInputType extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'lib-stepper-test-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyForm, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <formly-form
        [form]="form"
        [fields]="fields"
        [model]="model"
      />
    </form>
  `,
})
class StepperTestHost {
  readonly form = new FormGroup({});
  readonly model: Record<string, unknown> = {};
  fields: FormlyFieldConfig[] = [];
}

describe('StepperType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperTestHost],
      providers: [
        provideFormlyCore([
          withStepType(),
          withStepperType(),
          { types: [{ name: 'test-input', component: TestInputType }] },
        ]),
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  function createStepper(
    stepperProps: Record<string, unknown> = {},
    fieldGroup: FormlyFieldConfig[] = defaultSteps(),
  ): ComponentFixture<StepperTestHost> {
    const fixture = TestBed.createComponent(StepperTestHost);
    fixture.componentInstance.fields = [
      {
        type: 'stepper',
        props: stepperProps,
        fieldGroup,
      },
    ];
    fixture.detectChanges();
    return fixture;
  }

  function getStepper(fixture: ComponentFixture<StepperTestHost>): MatStepper | undefined {
    return fixture.debugElement.query(By.directive(MatStepper))?.componentInstance as
      MatStepper | undefined;
  }

  function renderedLabels(fixture: ComponentFixture<StepperTestHost>): string[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.mat-step-text-label'),
      (label) => label.textContent?.trim() ?? '',
    );
  }

  function defaultSteps(): FormlyFieldConfig[] {
    return [
      {
        type: 'step',
        props: { label: 'Personal data', nextButtonLabel: 'Continue' },
        fieldGroup: [
          {
            key: 'name',
            type: 'test-input',
            props: { required: true },
          },
        ],
      },
      {
        type: 'step',
        props: {
          label: 'Destination',
          optional: true,
          disableEdit: true,
          previousButtonLabel: 'Return',
        },
        fieldGroup: [{ key: 'country', type: 'test-input' }],
      },
    ];
  }

  it('registers the stepper Formly type with workflow defaults', () => {
    expect(withStepperType()).toEqual({
      types: [
        {
          name: 'stepper',
          component: StepperType,
          defaultOptions: {
            props: {
              ariaLabel: 'Form steps',
              linear: false,
              orientation: 'horizontal',
            },
          },
        },
      ],
    });
  });

  it('shows guidance instead of rendering an empty stepper', () => {
    const fixture = createStepper({}, []);

    expect(fixture.nativeElement.textContent).toContain('Add a Step to get started');
    expect(getStepper(fixture)).toBeUndefined();
  });

  it.each([
    ['a non-Step child', [{ type: 'test-input', key: 'name' }]],
    [
      'mixed Step and non-Step children',
      [defaultSteps()[0], { type: 'test-input', key: 'country' }],
    ],
    ['a hidden non-Step child', [defaultSteps()[0], { type: 'test-input', hide: true }]],
  ])('rejects %s without rendering any children', (_description, children) => {
    const fixture = createStepper({}, children as FormlyFieldConfig[]);

    expect(fixture.nativeElement.textContent).toContain(
      'Stepper children must use the Step field type',
    );
    expect(getStepper(fixture)).toBeUndefined();
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(0);
  });

  it('renders Step children and delegates arbitrary content and navigation', () => {
    const fixture = createStepper();
    const stepper = getStepper(fixture);
    const matSteps = stepper?.steps.toArray() ?? [];
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.mat-stepper-previous, .mat-stepper-next',
      ),
    );

    expect(renderedLabels(fixture)).toEqual(['Personal data', 'Destination']);
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(2);
    expect(matSteps[0].editable).toBe(true);
    expect(matSteps[1].optional).toBe(true);
    expect(matSteps[1].editable).toBe(false);
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Continue', 'Return']);
    expect(buttons.every((button) => button.type === 'button')).toBe(true);

    buttons[0].click();
    fixture.detectChanges();
    expect(stepper?.selectedIndex).toBe(1);
  });

  it('omits hidden Steps and shows empty guidance when all Steps are hidden', () => {
    const steps = defaultSteps();
    steps.splice(1, 0, {
      type: 'step',
      hide: true,
      props: { label: 'Hidden step' },
      fieldGroup: [{ key: 'secret', type: 'test-input' }],
    });

    const fixture = createStepper({}, steps);
    expect(renderedLabels(fixture)).toEqual(['Personal data', 'Destination']);
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(2);

    const hiddenFixture = createStepper(
      {},
      steps.map((step) => ({ ...step, hide: true })),
    );
    expect(hiddenFixture.nativeElement.textContent).toContain('Add a Step to get started');
    expect(getStepper(hiddenFixture)).toBeUndefined();
  });

  it('uses each Step subtree to gate linear navigation', () => {
    const steps = defaultSteps();
    const fixture = createStepper({ linear: true }, steps);
    const stepper = getStepper(fixture);
    const headers = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      '.mat-step-header',
    );

    headers[1].click();
    fixture.detectChanges();
    expect(stepper?.selectedIndex).toBe(0);

    steps[0].fieldGroup?.[0].formControl?.setValue('Ada');
    fixture.detectChanges();

    headers[1].click();
    fixture.detectChanges();
    expect(stepper?.selectedIndex).toBe(1);
  });
});
