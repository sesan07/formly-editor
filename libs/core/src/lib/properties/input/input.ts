import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { KeyFilter } from 'primeng/keyfilter';
import { InputProperty } from './input.directive';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-input-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputText, KeyFilter, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      @if (property().dataType === 'number') {
        <input
          class="field-property-control"
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
          class="field-property-control"
          pInputText
          [id]="inputId"
          [type]="property().dataType"
          [placeholder]="property().placeholder || ''"
          [ngModel]="currentValue()"
          (ngModelChange)="onValueChange($event)"
        />
      }
    </core-field-property-wrapper>
  `,
})
export class FieldInputProperty extends InputProperty {
  inputId = `input-property-input-${Math.random().toString(36).substring(2, 15)}`;
}
