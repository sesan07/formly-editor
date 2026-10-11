import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FieldArrayType, FormlyField } from '@ngx-formly/core';

@Component({
  selector: 'lib-repeating-section-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyField, MatIconButton, MatIcon, MatButton],
  template: `
    @if (props.label) {
      <legend>{{ props.label }}</legend>
    }
    @if (props.description) {
      <p>{{ props.description }}</p>
    }

    @for (f of field.fieldGroup; track $index) {
      <div style="display: flex">
        <formly-field
          style="flex-grow: 1"
          [field]="f"
        />
        <button
          mat-icon-button
          color="warn"
          (click)="remove($index)"
        >
          <mat-icon>remove</mat-icon>
        </button>
      </div>
    }
    <div style="margin: 16px 0">
      <button
        mat-flat-button
        color="primary"
        (click)="add()"
      >
        {{ props['addText'] }}
      </button>
    </div>
  `,
})
export class RepeatingSectionType extends FieldArrayType {}
