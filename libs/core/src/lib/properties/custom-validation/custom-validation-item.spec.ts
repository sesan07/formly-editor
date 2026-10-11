import { CoreFieldService } from '../../config/core-field.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';
import { CustomValidationItem } from './custom-validation-item';

describe('CustomValidationItem', () => {
  let fixture: ComponentFixture<CustomValidationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomValidationItem],
      providers: [
        provideNoopAnimations(),
        {
          provide: CoreFieldService,
          useValue: { validationMessagesPath: ['validation', 'messages'] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomValidationItem);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('path', ['validators', 'validation', '0']);
    fixture.componentRef.setInput('target', {
      validators: { validation: [{ name: 'externalValidator', options: { mode: 'strict' } }] },
      validation: { messages: { externalValidator: 'External validation failed' } },
    });
    fixture.componentRef.setInput('name', 'externalValidator');
    fixture.componentRef.setInput('validationOptions', [{ label: 'IP Address', value: 'ip' }]);
    fixture.detectChanges();
  });

  it('renders unavailable validators read-only and preserves the remove action', () => {
    const remove = vi.fn();
    fixture.componentInstance.remove.subscribe(remove);

    expect(fixture.nativeElement.textContent).toContain('externalValidator');
    expect(fixture.nativeElement.textContent).toContain('Unavailable');
    expect(fixture.nativeElement.querySelector('core-field-select-property')).toBeNull();
    expect(fixture.nativeElement.querySelector('core-validation-message-input')).not.toBeNull();

    fixture.nativeElement.querySelector('button[aria-label="Remove validation"]').click();
    expect(remove).toHaveBeenCalledOnce();
  });
});
