import { CoreFieldService } from '../../config/core-field.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PropertyChangeType } from '../types';
import { ValidationMessageInput } from './validation-message-input';

describe('ValidationMessageInput', () => {
  let fixture: ComponentFixture<ValidationMessageInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationMessageInput],
      providers: [
        {
          provide: CoreFieldService,
          useValue: { validationMessagesPath: ['validation', 'messages'] },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ValidationMessageInput);
    fixture.componentRef.setInput('validatorName', 'required');
    fixture.componentRef.setInput('target', {
      validation: { messages: { required: 'Required field' } },
    });
    fixture.detectChanges();
  });

  it('writes a message to the validator-specific native path', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance['setMessage']('Please provide a value');

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['validation', 'messages', 'required'],
      value: 'Please provide a value',
    });
  });

  it('clears a blank override so Formly can use its registered default', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance['setMessage']('');

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.CLEAR,
      path: ['validation', 'messages', 'required'],
    });
  });
});
