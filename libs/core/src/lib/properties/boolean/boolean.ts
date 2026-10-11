import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { BooleanProperty } from './boolean.directive';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-boolean-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ToggleSwitch, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="switchId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <p-toggleswitch
        [id]="switchId"
        [ngModel]="currentValue()"
        (ngModelChange)="onValueChange($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldBooleanProperty extends BooleanProperty {
  switchId = `boolean-property-switch-${Math.random().toString(36).substring(2, 15)}`;
}
