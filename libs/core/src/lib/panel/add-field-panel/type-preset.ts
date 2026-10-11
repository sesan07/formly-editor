import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTypePreset } from '../../config/types';
import { TypeContainer } from './type-option-container';

@Component({
  selector: 'core-add-field-type-preset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeContainer],
  host: {
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <core-type-container
      class="justify-between"
      [fieldType]="preset().typeOption!.name"
      [preset]="preset()"
      [showActions]="isMouseInside()"
    >
      <span class="inline-flex items-center gap-2">
        <i
          class="material-symbols-outlined pointer-events-none"
          style="font-size: 16px;"
          [class.opacity-30]="isMouseInside()"
          [class.opacity-0]="!isMouseInside()"
          >drag_indicator</i
        >
        <i class="material-symbols-outlined">{{ preset().typeOption!.materialSymbol }}</i>
        <span>{{ preset().displayName }}</span>
      </span>
    </core-type-container>
  `,
})
export class TypePreset {
  readonly preset = input.required<FieldTypePreset>();

  readonly isMouseInside = signal(false);
}
