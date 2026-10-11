import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { DividerProps } from './types';

@Component({
  selector: 'lib-divider-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDivider],
  template: `
    <mat-divider
      [vertical]="props.vertical ?? false"
      [inset]="props.inset ?? false"
    />
  `,
})
export class DividerType extends FieldType<FormlyFieldConfig<DividerProps>> {}
