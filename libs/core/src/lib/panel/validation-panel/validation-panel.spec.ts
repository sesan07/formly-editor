import { CoreFormService } from '../../editor/core-form.service';
import { CoreFieldService } from '../../config/core-field.service';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorField } from '../../model/types';
import { createBooleanProperty } from '../../properties';
import { PropertyChange, PropertyChangeType } from '../../properties/types';
import { ValidationPanel } from './validation-panel';

describe('ValidationPanel', () => {
  const field = {
    type: 'input',
    _info: {
      id: 'field-1',
      name: 'Input',
      formId: 'form-1',
      idPath: ['field-1'],
    },
  } as EditorField;
  const activeField = signal<EditorField | null>(field);
  const validationConfig = {
    rules: [
      {
        name: 'required',
        property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
      },
    ],
  };
  const getValidationConfig = vi.fn(() => validationConfig);
  const modifyActiveField = vi.fn();
  let fixture: ComponentFixture<ValidationPanel>;

  beforeEach(async () => {
    activeField.set(field);
    getValidationConfig.mockClear();
    modifyActiveField.mockClear();

    TestBed.overrideComponent(ValidationPanel, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    await TestBed.configureTestingModule({
      imports: [ValidationPanel],
      providers: [
        {
          provide: CoreFormService,
          useValue: { activeField, modifyActiveField },
        },
        {
          provide: CoreFieldService,
          useValue: {
            getValidationConfig,
            isFieldEqual: (left: EditorField, right: EditorField) => left.type === right.type,
            validationMessagesPath: ['validation', 'messages'],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationPanel);
    fixture.detectChanges();
  });

  it('resolves validation properties for the selected field', () => {
    expect(getValidationConfig).toHaveBeenCalledWith(field);
    expect(fixture.componentInstance['config']()).toEqual(validationConfig);
  });

  it('does not resolve properties without a selected field', () => {
    activeField.set(null);
    fixture.detectChanges();

    expect(fixture.componentInstance['config']()).toBeUndefined();
  });

  it('routes property changes through the active field service', () => {
    const change: PropertyChange = {
      type: PropertyChangeType.VALUE,
      path: ['props', 'required'],
      value: true,
    };

    fixture.componentInstance['onFieldChanged'](change);

    expect(modifyActiveField).toHaveBeenCalledWith(change);
  });
});
