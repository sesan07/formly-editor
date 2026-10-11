import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyForm,
  provideFormlyCore,
} from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { withStepperType } from '../stepper/config';
import { withStepType } from './config';
import { StepType } from './step';

@Component({
  selector: 'lib-step-test-input-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="formControl" />`,
})
class TestInputType extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'lib-step-test-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyForm, ReactiveFormsModule],
  template: `<formly-form
    [form]="form"
    [fields]="fields"
    [model]="model"
  />`,
})
class StepTestHost {
  readonly form = new FormGroup({});
  readonly model: Record<string, unknown> = {};
  fields: FormlyFieldConfig[] = [];
}

describe('StepType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTestHost],
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

  function createHost(fields: FormlyFieldConfig[]): ComponentFixture<StepTestHost> {
    const fixture = TestBed.createComponent(StepTestHost);
    fixture.componentInstance.fields = fields;
    fixture.detectChanges();
    return fixture;
  }

  function stepWithChild(): FormlyFieldConfig {
    return {
      type: 'step',
      props: { label: 'Details' },
      fieldGroup: [{ key: 'name', type: 'test-input' }],
    };
  }

  it('registers the Step Formly type', () => {
    expect(withStepType()).toEqual({
      types: [{ name: 'step', component: StepType }],
    });
  });

  it('rejects a root Step without rendering its children', () => {
    const fixture = createHost([stepWithChild()]);

    expect(fixture.nativeElement.textContent).toContain(
      'Step field must be placed directly inside a Stepper',
    );
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(0);
  });

  it('rejects a Step nested under a non-Stepper parent without rendering its children', () => {
    const fixture = createHost([
      {
        type: 'formly-group',
        fieldGroup: [stepWithChild()],
      },
    ]);

    expect(fixture.nativeElement.textContent).toContain(
      'Step field must be placed directly inside a Stepper',
    );
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(0);
  });

  it('applies fieldGroupClassName to the Step child container', () => {
    const fixture = createHost([
      {
        type: 'stepper',
        fieldGroup: [{ ...stepWithChild(), fieldGroupClassName: 'step-content' }],
      },
    ]);

    expect(
      fixture.nativeElement.querySelector('.step-content').classList.contains('step-content'),
    ).toBe(true);
  });
});
