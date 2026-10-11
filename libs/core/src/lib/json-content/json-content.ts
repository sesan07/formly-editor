import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { isEmpty } from 'lodash-es';
import { Message } from 'primeng/message';
import { map } from 'rxjs';
import { CodeEditor } from '../shared';
import { JSONValidationError } from './types';

@Component({
  selector: 'core-json-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeEditor, Message],
  host: { class: 'relative block w-full' },
  template: `
    <core-code-editor
      mode="json"
      [editable]="editable()"
      [text]="value()"
      (textChange)="onChange($event)"
      (blur)="onTouched()"
    />
    @if (editable()) {
      <div class="absolute right-4 bottom-4 flex flex-col gap-2">
        @for (error of validationErrors(); track $index) {
          <p-message severity="error">
            <ng-template #icon>
              <i class="material-symbols-outlined">error</i>
            </ng-template>
            <div>
              <div>{{ error.label }}</div>
              @for (message of error.messages; track $index) {
                <div>{{ message }}</div>
              }
            </div>
          </p-message>
        } @empty {
          <p-message severity="success">
            <ng-template #icon>
              <i class="material-symbols-outlined">check</i>
            </ng-template>
            JSON is valid
          </p-message>
        }
      </div>
    }
  `,
})
export class JSONContent implements ControlValueAccessor {
  readonly editable = input(true, { transform: booleanAttribute });

  protected control = inject(NgControl, { self: true });

  protected onChange!: (_: string) => void;
  protected onTouched!: () => void;

  readonly value = signal('');
  readonly validationErrors: Signal<JSONValidationError[]>;

  constructor() {
    this.control.valueAccessor = this;
    if (!this.control.statusChanges) {
      throw new Error('Unable to access statusChanges');
    }

    this.validationErrors = toSignal(
      this.control.statusChanges.pipe(
        map((status) => {
          if (status === 'INVALID' && !isEmpty(this.control.errors)) {
            return Object.entries(this.control.errors).flatMap(([errorKey, errorValue]) => {
              if (errorKey === 'required') {
                return {
                  label: 'REQUIRED',
                  messages: ['JSON is required'],
                };
              }

              if (Array.isArray(errorValue)) {
                return errorValue as JSONValidationError[];
              }

              return {
                label: errorKey.toUpperCase(),
                messages: ['JSON is not valid'],
              };
            });
          }
          return [];
        }),
      ),
      { initialValue: [] },
    );

    this.control.valueChanges?.subscribe((v) => this.value.set(v));
  }

  writeValue(val: string): void {
    this.value.set(val);
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
