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
import { withTabsType } from '../tabs/config';
import { withTabType } from './config';
import { TabType } from './tab';

@Component({
  selector: 'lib-tab-test-input-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="formControl" />`,
})
class TestInputType extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'lib-tab-test-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyForm, ReactiveFormsModule],
  template: `<formly-form
    [form]="form"
    [fields]="fields"
    [model]="model"
  />`,
})
class TabTestHost {
  readonly form = new FormGroup({});
  readonly model: Record<string, unknown> = {};
  fields: FormlyFieldConfig[] = [];
}

describe('TabType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabTestHost],
      providers: [
        provideFormlyCore([
          withTabType(),
          withTabsType(),
          { types: [{ name: 'test-input', component: TestInputType }] },
        ]),
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  function createHost(fields: FormlyFieldConfig[]): ComponentFixture<TabTestHost> {
    const fixture = TestBed.createComponent(TabTestHost);
    fixture.componentInstance.fields = fields;
    fixture.detectChanges();
    return fixture;
  }

  function tabWithChild(): FormlyFieldConfig {
    return {
      type: 'tab',
      props: { label: 'Details' },
      fieldGroup: [{ key: 'name', type: 'test-input' }],
    };
  }

  it('registers the Tab Formly type', () => {
    expect(withTabType()).toEqual({
      types: [{ name: 'tab', component: TabType }],
    });
  });

  it('rejects a root Tab without rendering its children', () => {
    const fixture = createHost([tabWithChild()]);

    expect(fixture.nativeElement.textContent).toContain(
      'Tab field must be placed directly inside Tabs',
    );
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(0);
  });

  it('renders children and applies fieldGroupClassName inside Tabs', () => {
    const fixture = createHost([
      {
        type: 'tabs',
        fieldGroup: [{ ...tabWithChild(), fieldGroupClassName: 'tab-content' }],
      },
    ]);

    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.tab-content')).toBeTruthy();
  });
});
