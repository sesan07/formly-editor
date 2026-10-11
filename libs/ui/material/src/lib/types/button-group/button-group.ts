import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { ButtonGroupOption } from './types';

@Component({
  selector: 'lib-button-group-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonToggle, MatButtonToggleGroup, ReactiveFormsModule],
  template: `
    <div>
      <mat-button-toggle-group
        [formControl]="control"
        [attr.aria-label]="label || 'Button group'"
      >
        @for (option of buttonOptions; track $index) {
          <mat-button-toggle
            [value]="option.value"
            [disabled]="option.disabled === true"
          >
            {{ option.label }}
          </mat-button-toggle>
        }
      </mat-button-toggle-group>
    </div>
  `,
})
export class ButtonGroupType extends FieldType<FormlyFieldConfig> {
  get control(): FormControl {
    return this.formControl as FormControl;
  }

  get buttonOptions(): readonly ButtonGroupOption[] {
    const configuredOptions = this.props['options'];
    return Array.isArray(configuredOptions) ? configuredOptions : [];
  }

  get label(): string | undefined {
    const label = this.props['label'];
    return typeof label === 'string' && label.length > 0 ? label : undefined;
  }
}
