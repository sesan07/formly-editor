import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTypeOption } from '../../config/types';
import { TypeContainer } from './type-option-container';

@Component({
  selector: 'core-add-field-type-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeContainer],
  host: {
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <core-type-container
      class="justify-between"
      [fieldType]="type().name"
      [showActions]="isMouseInside()"
    >
      <span class="inline-flex items-center gap-2">
        <i
          class="material-symbols-outlined pointer-events-none"
          [class.opacity-30]="isMouseInside()"
          [class.opacity-0]="!isMouseInside()"
          >drag_indicator</i
        >
        <i class="material-symbols-outlined size-7">{{ type().materialSymbol }}</i>
        {{ type().displayName }}
      </span>
    </core-type-container>
  `,
})
export class TypeOption {
  readonly type = input.required<FieldTypeOption>();

  readonly isMouseInside = signal(false);
}
