import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Divider } from 'primeng/divider';
import { PanelOptionConfig } from '../panel';
import { PanelOption } from './panel-option';

@Component({
  selector: 'core-panel-option-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Divider, PanelOption],
  host: {
    class: 'flex',
  },
  template: `
    @if (position() === 'right') {
      <p-divider
        class="h-full"
        layout="vertical"
      />
    }
    <ul>
      @for (option of options(); track option.value) {
        <li>
          <core-panel-option
            [matIcon]="option.matIcon"
            [label]="option.label"
            [value]="option.value"
            [isActive]="option.value === value()"
            [position]="position()"
            (selected)="selectOption(option.value)"
          />
        </li>
      }
    </ul>
    @if (position() === 'left') {
      <p-divider
        class="h-full"
        layout="vertical"
      />
    }
  `,
})
export class PanelOptionList {
  readonly options = input.required<PanelOptionConfig[]>();
  readonly position = input.required<'left' | 'right'>();
  readonly value = model.required<string>();
  readonly selected = output<string>();

  selectOption(value: string): void {
    this.value.set(value);
    this.selected.emit(value);
  }
}
