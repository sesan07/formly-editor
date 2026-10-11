import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
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
import { withTabType } from '../tab/config';
import { withTabsType } from './config';
import { TabsType } from './tabs';

@Component({
  selector: 'lib-tabs-test-input-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="formControl" />`,
})
class TestInputType extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'lib-tabs-test-host',
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
class TabsTestHost {
  readonly form = new FormGroup({});
  readonly model: Record<string, unknown> = {};
  fields: FormlyFieldConfig[] = [];
}

describe('TabsType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsTestHost],
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

  function createTabs(
    tabsProps: Record<string, unknown> = {},
    fieldGroup: FormlyFieldConfig[] = defaultTabs(),
  ): ComponentFixture<TabsTestHost> {
    const fixture = TestBed.createComponent(TabsTestHost);
    fixture.componentInstance.fields = [
      {
        type: 'tabs',
        props: tabsProps,
        fieldGroup,
      },
    ];
    fixture.detectChanges();
    return fixture;
  }

  function getTabs(fixture: ComponentFixture<TabsTestHost>): MatTabGroup | undefined {
    return fixture.debugElement.query(By.directive(MatTabGroup))?.componentInstance as
      MatTabGroup | undefined;
  }

  function defaultTabs(): FormlyFieldConfig[] {
    return [
      {
        type: 'tab',
        props: { label: 'Personal data' },
        fieldGroup: [{ key: 'name', type: 'test-input' }],
      },
      {
        type: 'tab',
        props: { label: 'Destination', disabled: true },
        fieldGroup: [{ key: 'country', type: 'test-input' }],
      },
    ];
  }

  it('registers the tabs Formly type', () => {
    expect(withTabsType()).toEqual({
      types: [
        {
          name: 'tabs',
          component: TabsType,
        },
      ],
    });
  });

  it('shows guidance instead of rendering an empty tabs group', () => {
    const fixture = createTabs({}, []);

    expect(fixture.nativeElement.textContent).toContain('Add a Tab to get started');
    expect(getTabs(fixture)).toBeUndefined();
  });

  it('rejects non-Tab children without rendering them', () => {
    const fixture = createTabs({}, [{ type: 'test-input', key: 'name' }]);

    expect(fixture.nativeElement.textContent).toContain(
      'Tabs children must use the Tab field type',
    );
    expect(getTabs(fixture)).toBeUndefined();
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(0);
  });

  it('renders labels and disabled state', () => {
    const fixture = createTabs();
    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.mat-mdc-tab'),
      (label) => label.textContent?.trim() ?? '',
    );

    expect(labels).toEqual(['Personal data', 'Destination']);
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(1);
    expect(fixture.nativeElement.querySelectorAll('.mat-mdc-tab-disabled')).toHaveLength(1);
  });

  it('preserves an inactive tab body after it has been activated', () => {
    const fields = defaultTabs().map((tab) => ({
      ...tab,
      props: { ...tab.props, disabled: false },
    }));
    const fixture = createTabs({ preserveContent: true }, fields);
    const tabs = getTabs(fixture);

    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(1);

    tabs?.selectedIndexChange.emit(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(2);
  });

  it('updates the selected tab', () => {
    const fixture = createTabs();
    const tabs = getTabs(fixture);

    tabs?.selectedIndexChange.emit(1);
    fixture.detectChanges();
    expect(tabs?.selectedIndex).toBe(1);
  });
});
