import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormlyConfig, FormlyField, FormlyForm, FormlyFormBuilder } from '@ngx-formly/core';
import { Message } from 'primeng/message';
import { FormlyFieldTemplates } from './formly.template';

@Component({
  selector: 'core-formly-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormlyFormBuilder, FormlyFieldTemplates],
  imports: [FormlyField, Message],
  template: `
    @if (formError()) {
      <p-message severity="error">
        <ng-template #icon>
          <i class="material-symbols-outlined">error</i>
        </ng-template>
        {{ formError() }}
      </p-message>
    } @else {
      <formly-field [field]="field" />
    }
  `,
})
export class CoreFormlyForm extends FormlyForm implements OnChanges {
  readonly formError = signal('');

  // This constructor replaces uses the local FormlyFieldTemplates
  // (instead of the one in ngx-formly, which isn't exported)
  constructor(
    // eslint-disable-next-line @angular-eslint/prefer-inject
    builder: FormlyFormBuilder,
    // eslint-disable-next-line @angular-eslint/prefer-inject
    config: FormlyConfig,
    // eslint-disable-next-line @angular-eslint/prefer-inject
    ngZone: NgZone,
    // eslint-disable-next-line @angular-eslint/prefer-inject
    fieldTemplates: FormlyFieldTemplates,
  ) {
    super(builder, config, ngZone, fieldTemplates);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    try {
      super.ngOnChanges(changes);
      this.formError.set('');
    } catch (e) {
      this.field.fieldGroup = [];

      const error = e as Error;
      this.formError.set(`Build Error: ${error.message}`);
      console.error(error);
    }
  }
}
