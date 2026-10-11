import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { PostalCodeMaskDirective } from './postal-code-mask';
import { PostalCodeProps } from './types';

@Component({
  selector: 'lib-postal-code-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatInput, PostalCodeMaskDirective, ReactiveFormsModule],
  template: `
    <input
      matInput
      libPostalCodeMask
      type="text"
      [id]="id"
      [attr.name]="field.name"
      [formControl]="formControl"
      [readonly]="props.readonly"
      [required]="required"
      [errorStateMatcher]="errorStateMatcher"
      [tabIndex]="props.tabindex"
      [placeholder]="props.placeholder || ''"
      [mask]="props.mask || ''"
      [storeRawValue]="props.storeRawValue === true"
      [autoCapitalize]="props.autoCapitalize !== false"
      [postalCodePattern]="props.postalCodePattern"
      [attr.inputmode]="props.inputMode || 'text'"
      [attr.autocapitalize]="props.autoCapitalize === false ? 'none' : 'characters'"
      [attr.autocomplete]="autocomplete"
    />
  `,
})
export class PostalCodeType extends FieldType<FieldTypeConfig<PostalCodeProps>> {
  get autocomplete(): string {
    const context = this.props.autocompleteContext;
    return context === 'shipping' || context === 'billing'
      ? `${context} postal-code`
      : 'postal-code';
  }
}
