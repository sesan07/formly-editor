import { CoreFieldService } from '../../config/core-field.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';
import { PropertyChangeType } from '../types';
import { FieldCustomValidationProperty } from './custom-validation';
import { createCustomValidationProperty } from './custom-validation.config';

describe('FieldCustomValidationProperty', () => {
  let fixture: ComponentFixture<FieldCustomValidationProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldCustomValidationProperty],
      providers: [
        provideNoopAnimations(),
        {
          provide: CoreFieldService,
          useValue: { validationMessagesPath: ['validation', 'messages'] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldCustomValidationProperty);
    fixture.componentRef.setInput(
      'property',
      createCustomValidationProperty({
        label: 'Custom Validation',
        key: 'validators.validation',
        validationOptions: [{ label: 'IP Address', value: 'ip' }],
      }),
    );
    fixture.componentRef.setInput('path', ['validators', 'validation']);
    fixture.componentRef.setInput('target', {
      validators: { validation: [{ name: 'ip' }] },
      validation: { messages: { ip: 'Invalid IP address' } },
    });
    fixture.detectChanges();
  });

  it('removes a validator without deleting its message', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onRemoveChild(0);

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['validators', 'validation'],
      value: [],
    });
    expect(changed).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: ['validation', 'messages', 'ip'] }),
    );
  });
});
