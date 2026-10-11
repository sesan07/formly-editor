import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { KeyFilter } from 'primeng/keyfilter';
import { InputProperty } from '../../properties/input/input.directive';
import { Tooltip } from '../../shared/tooltip';
import { ModelPropertyKey } from './property-key';
import { ModelPropertyWrapper } from './property-wrapper';

@Component({
  selector: 'core-model-input-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModelPropertyKey,
    InputText,
    KeyFilter,
    FormsModule,
    ButtonDirective,
    ButtonIcon,
    ModelPropertyWrapper,
    Tooltip,
  ],
  template: `
    <core-model-property-wrapper [level]="level()">
      <span class="inline-flex min-w-0 grow items-center gap-2">
        <span class="invisible size-8 shrink-0"> </span>
        <span class="inline-flex items-center gap-0.5">
          <core-model-property-key
            [property]="property()"
            (keyChange)="onKeyChanged($event)"
          />
          <span>:</span>
        </span>

        @if (property().dataType === 'number') {
          <input
            #input
            class="h-9 min-w-0 grow truncate"
            pInputText
            pKeyFilter="num"
            type="number"
            [id]="inputId"
            [placeholder]="property().placeholder || ''"
            [ngModel]="currentValue()"
            (ngModelChange)="onValueChange($event)"
          />
        } @else {
          <input
            #input
            class="h-9 min-w-0 grow truncate"
            pInputText
            type="text"
            [id]="inputId"
            [placeholder]="property().placeholder || ''"
            [ngModel]="currentValue()"
            (ngModelChange)="onValueChange($event)"
          />
        }
      </span>
      <ng-container actions>
        @if (property().isRemovable) {
          <button
            pButton
            text
            class="size-8"
            rounded
            severity="danger"
            aria-label="Remove"
            coreTooltip="Remove"
            tooltipPosition="top"
            (click)="remove.emit()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              delete
            </i>
          </button>
        }
      </ng-container>
    </core-model-property-wrapper>
  `,
})
export class ModelInputProperty extends InputProperty {
  readonly level = input(0, { transform: numberAttribute });

  inputId = `input-property-input-${Math.random().toString(36).substring(2, 15)}`;
}
