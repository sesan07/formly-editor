import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { get } from 'lodash-es';
import { InputText } from 'primeng/inputtext';
import { FieldPropertyWrapper } from '../property-wrapper';
import { PropertyChange, PropertyChangeType } from '../types';

@Component({
  selector: 'core-validation-message-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldPropertyWrapper, FormsModule, InputText],
  template: `
    <core-field-property-wrapper
      isClearable
      [label]="label()"
      [labelForId]="inputId"
      (clear)="clearMessage()"
    >
      <input
        class="field-property-control"
        pInputText
        type="text"
        placeholder="Defaults to global message"
        [id]="inputId"
        [ngModel]="message()"
        (ngModelChange)="setMessage($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class ValidationMessageInput {
  readonly validatorName = input.required<string>();
  readonly validatorLabel = input<string>();
  readonly target = input.required<Record<string, unknown>>();
  readonly targetChanged = output<PropertyChange>();

  private readonly fieldService = inject(CoreFieldService);

  private readonly messagesPath = this.fieldService.validationMessagesPath;
  protected readonly inputId = `validation-message-${Math.random().toString(36).substring(2, 15)}`;
  protected readonly label = computed(
    () => `${this.validatorLabel() ? this.validatorLabel() + ' ' : ''}Message`,
  );
  private readonly path = computed(() => [...this.messagesPath, this.validatorName()]);
  private readonly value = computed(() => get(this.target(), this.path()));
  protected readonly message = computed(() =>
    typeof this.value() === 'string' ? this.value() : '',
  );

  protected setMessage(value: string): void {
    if (!value) {
      this.clearMessage();
      return;
    }

    this.targetChanged.emit({
      type: PropertyChangeType.VALUE,
      path: this.path(),
      value,
    });
  }

  protected clearMessage(): void {
    this.targetChanged.emit({
      type: PropertyChangeType.CLEAR,
      path: this.path(),
    });
  }
}
