import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'core-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputGroup, InputGroupAddon, InputText, ButtonDirective, ButtonIcon],
  template: `
    <p-inputgroup>
      <p-inputgroup-addon>
        <i class="material-symbols-outlined"> search </i>
      </p-inputgroup-addon>
      <input
        #input
        class="w-full truncate text-sm"
        pInputText
        type="text"
        placeholder="Filter items..."
        [(ngModel)]="value"
      />
      <p-inputgroup-addon>
        <button
          pButton
          aria-label="Clear filter"
          severity="secondary"
          (click)="clear.emit()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            clear
          </i>
        </button>
      </p-inputgroup-addon>
    </p-inputgroup>
  `,
})
export class Filter {
  readonly value = model.required<string>();
  clear = output();
}
