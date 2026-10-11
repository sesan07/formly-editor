import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { SelectButton } from 'primeng/selectbutton';
import { PropertyChange } from '../../properties/types';
import { StylingOption } from './styling-option';
import { ClassType, CORE_STYLES_CONFIG, StyleOptionCategory } from './types';

@Component({
  selector: 'core-styling-class-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectButton, FormsModule, Panel, StylingOption],
  host: { class: 'flex flex-col gap-2' },
  template: `
    <p-selectbutton
      optionLabel="name"
      optionValue="value"
      allowEmpty="false"
      [options]="stylesConfig.breakpoints"
      [(ngModel)]="activeBreakpointValue"
    />
    <h4>{{ activeBreakpoint().description }}</h4>
    <div>
      @for (category of activeCategories(); track category.name) {
        <p-panel [header]="category.name">
          <div class="grid grid-cols-2 gap-2">
            @for (option of category.options; track option.name) {
              <core-styling-option
                [class.col-span-2]="option.spanWidth"
                [option]="option"
                [breakpoint]="activeBreakpoint()"
                [classType]="classType()"
                (fieldChange)="fieldChange.emit($event)"
              />
            }
          </div>
        </p-panel>
      }
    </div>
  `,
})
export class StylingClassType {
  readonly classType = input.required<ClassType>();
  readonly classNameMap = input.required<Record<string, StyleOptionCategory[]>>();
  readonly fieldGroupClassNameMap = input.required<Record<string, StyleOptionCategory[]>>();

  stylesConfig = inject(CORE_STYLES_CONFIG);

  fieldChange = output<PropertyChange>();

  readonly activeCategories = computed(() =>
    this.classType() === ClassType.CLASS_NAME
      ? this.classNameMap()[this.activeBreakpointValue()]
      : this.fieldGroupClassNameMap()[this.activeBreakpointValue()],
  );
  readonly activeBreakpoint = computed(() => this.breakpointMap[this.activeBreakpointValue()]);

  breakpoints = this.stylesConfig.breakpoints;
  breakpointMap = Object.fromEntries(this.stylesConfig.breakpoints.map((bp) => [bp.value, bp]));

  readonly activeBreakpointValue = signal<string>(this.breakpoints[0].value);
}
