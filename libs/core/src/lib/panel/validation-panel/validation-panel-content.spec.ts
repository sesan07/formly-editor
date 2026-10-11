import { CoreFieldService } from '../../config/core-field.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { createBooleanProperty, createCustomValidationProperty } from '../../properties/index';
import { PropertyChangeType } from '../../properties/types';
import { ValidationPanelContent } from './validation-panel-content';

describe('FieldValidationEditor', () => {
  let fixture: ComponentFixture<ValidationPanelContent>;

  beforeEach(async () => {
    TestBed.overrideComponent(ValidationPanelContent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    await TestBed.configureTestingModule({
      imports: [ValidationPanelContent],
      providers: [
        {
          provide: CoreFieldService,
          useValue: { validationMessagesPath: ['validation', 'messages'] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationPanelContent);
    fixture.componentRef.setInput('config', {
      rules: [
        {
          name: 'required',
          property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
        },
      ],
      customValidators: createCustomValidationProperty({
        label: 'Custom Validation',
        key: 'validators.validation',
        validationOptions: [{ label: 'IP', value: 'ip' }],
      }),
      asyncValidators: createCustomValidationProperty({
        label: 'Async Validation',
        key: 'asyncValidators.validation',
        validationOptions: [{ label: 'IP Async', value: 'ipAsync' }],
      }),
    });
    fixture.componentRef.setInput('target', {
      validators: { validation: [{ name: 'ip' }, { name: 'ip' }] },
      asyncValidators: { validation: ['ipAsync'] },
    });
    fixture.detectChanges();
  });

  it('does not render an arbitrary validation message editor', () => {
    expect(fixture.nativeElement.querySelector('core-other-validation-messages')).toBeNull();
  });

  it('shows a fixed-rule message only when the rule has a value', () => {
    const property = fixture.componentInstance.config().rules[0].property;

    expect(fixture.componentInstance['hasPropertyValue'](property)).toBe(false);

    fixture.componentRef.setInput('target', { props: { required: false } });

    expect(fixture.componentInstance['hasPropertyValue'](property)).toBe(true);
  });

  it('clears the paired message when the fixed rule is cleared', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    const ruleChange = { type: PropertyChangeType.CLEAR, path: ['props', 'required'] };
    fixture.componentInstance['onRuleChanged'](ruleChange, 'required');

    expect(changed).toHaveBeenNthCalledWith(1, ruleChange);
    expect(changed).toHaveBeenNthCalledWith(2, {
      type: PropertyChangeType.CLEAR,
      path: ['validation', 'messages', 'required'],
    });
  });

  it('keeps the paired message when the fixed rule receives a value', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    const ruleChange = { type: PropertyChangeType.VALUE, path: ['props', 'required'], value: true };
    fixture.componentInstance['onRuleChanged'](ruleChange, 'required');

    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenNthCalledWith(1, ruleChange);
  });
});
