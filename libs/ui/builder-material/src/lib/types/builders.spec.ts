import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatTabGroup } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BuilderFieldStateService, CoreFormService, FieldInfo } from '@formly-editor/core';
import {
  StepperContent,
  TabsContent,
  withStepperType,
  withStepType,
  withTabsType,
  withTabType,
} from '@formly-editor/material';
import { FormlyFieldConfig, FormlyForm, provideFormlyCore } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { withStepperTypeBuilder } from './stepper/config';
import { StepperTypeBuilder } from './stepper/stepper.builder';
import { withTabsTypeBuilder } from './tabs/config';
import { TabsTypeBuilder } from './tabs/tabs.builder';

interface TestField extends FormlyFieldConfig {
  _info: FieldInfo;
}

@Component({
  selector: 'lib-builder-test-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyForm, ReactiveFormsModule],
  template: `<formly-form
    [form]="form"
    [fields]="fields"
    [model]="model"
  />`,
})
class BuilderTestHost {
  readonly form = new FormGroup({});
  readonly model = {};
  fields: FormlyFieldConfig[] = [];
}

describe.each([
  {
    name: 'stepper',
    child: 'step',
    runtime: withStepperType,
    config: withStepperTypeBuilder,
    component: StepperTypeBuilder,
    content: StepperContent,
    header: '.mat-step-header',
  },
  {
    name: 'tabs',
    child: 'tab',
    runtime: withTabsType,
    config: withTabsTypeBuilder,
    component: TabsTypeBuilder,
    content: TabsContent,
    header: '.mat-mdc-tab',
  },
])('$name builder', (type) => {
  const fieldMap = signal<Record<string, TestField>>({});
  let state: BuilderFieldStateService;

  function createField(count = 3): TestField {
    return {
      type: type.name,
      _info: {
        id: 'container',
        formId: 'form',
        name: 'Container',
        childIds: [],
        idPath: ['container'],
      },
      fieldGroup: Array.from({ length: count }, (_, index) => ({
        type: type.child,
        props: { label: `Section ${index + 1}` },
        fieldGroup: [],
      })),
    };
  }

  function render(field: TestField): ComponentFixture<BuilderTestHost> {
    const fixture = TestBed.createComponent(BuilderTestHost);
    fixture.componentInstance.fields = [field];
    fixture.detectChanges();
    return fixture;
  }

  function control(fixture: ComponentFixture<BuilderTestHost>): MatStepper | MatTabGroup {
    return fixture.debugElement.query(
      By.directive(type.name === 'stepper' ? MatStepper : MatTabGroup),
    ).componentInstance;
  }

  beforeEach(async () => {
    fieldMap.set({ container: createField() });
    await TestBed.configureTestingModule({
      imports: [BuilderTestHost],
      providers: [
        provideFormlyCore([withStepType(), withTabType(), type.config()]),
        provideNoopAnimations(),
        BuilderFieldStateService,
        { provide: CoreFormService, useValue: { activeFieldMap: fieldMap.asReadonly() } },
      ],
    }).compileComponents();
    state = TestBed.inject(BuilderFieldStateService);
  });

  it('preserves runtime registration metadata while replacing only the component', () => {
    expect(type.config().types?.[0]).toEqual({
      ...type.runtime().types?.[0],
      component: type.component,
    });
  });

  it('reuses Material content and restores selection after Formly reconstruction', async () => {
    const raw = createField();
    const fixture = render(structuredClone(raw));
    expect(fixture.debugElement.query(By.directive(type.content))).toBeTruthy();
    const headers = fixture.nativeElement.querySelectorAll(type.header) as NodeListOf<HTMLElement>;
    headers[2].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(control(fixture).selectedIndex).toBe(2);
    expect(state.getState(raw)).toEqual({ selectedIndex: 2 });

    fixture.destroy();
    fieldMap.set({ container: structuredClone(raw) });
    const rebuilt = render(structuredClone(raw));
    expect(control(rebuilt).selectedIndex).toBe(2);
  });

  it('clamps restored state after a selected child is removed', () => {
    const raw = createField();
    state.setState(raw, { selectedIndex: 2 });
    const smaller = createField(2);
    fieldMap.set({ container: smaller });
    const fixture = render(structuredClone(smaller));

    expect(control(fixture).selectedIndex).toBe(1);
    expect(state.getState(smaller)).toEqual({ selectedIndex: 1 });
  });

  it('clamps against visible children, not hidden children', () => {
    const raw = createField();
    raw.fieldGroup![2].hide = true;
    state.setState(raw, { selectedIndex: 2 });
    const fixture = render(raw);

    expect(control(fixture).selectedIndex).toBe(1);
    expect(state.getState(raw)).toEqual({ selectedIndex: 1 });
  });

  it('resets selection to zero for an empty group', () => {
    const raw = createField(0);
    state.setState(raw, { selectedIndex: 2 });
    const fixture = render(raw);

    expect(fixture.nativeElement.textContent).toContain(
      `Add a ${type.child === 'step' ? 'Step' : 'Tab'}`,
    );
    expect(state.getState(raw)).toEqual({ selectedIndex: 0 });
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('normalizes invalid index %s', (index) => {
    const raw = createField();
    state.setState(raw, { selectedIndex: index });
    const fixture = render(raw);

    expect(control(fixture).selectedIndex).toBe(0);
    expect(state.getState(raw)).toEqual({ selectedIndex: 0 });
  });
});
