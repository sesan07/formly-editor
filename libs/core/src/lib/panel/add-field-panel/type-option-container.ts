import { CoreFormService } from '../../editor/core-form.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { DndDraggableDirective } from 'ngx-drag-drop';
import { MenuItem } from 'primeng/api';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { AddFieldService } from './add-field.service';
import { DNDService } from '../../editor/dnd.service';
import { FieldTypePreset } from '../../config/types';
import { DragData, DropAction } from '../../editor/types';
import { Tooltip } from '../../shared';

interface AddFieldAction extends MenuItem {
  icon: string;
  parentId?: string;
  index?: number;
}

@Component({
  selector: 'core-type-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, DndDraggableDirective, Menu, Tooltip],
  template: `
    <div
      class="relative flex cursor-grab items-center justify-between gap-2 rounded-lg p-2 text-center transition-colors hover:bg-primary/20"
      dndEffectAllowed="copy"
      [dndDraggable]="dragData()"
      (dndStart)="onDragStart()"
      (dndEnd)="onDragEnd()"
    >
      <ng-content />
      <span
        class="touch-actions-visible inline-flex shrink-0 gap-1 opacity-0 transition-opacity focus-within:opacity-100"
        [class.opacity-100]="showActions() || addMenuChild()?.visible"
      >
        <p-menu
          #addMenu
          appendTo="body"
          [model]="addActionsWithCommand()"
          [popup]="true"
        >
          <ng-template
            #item
            let-item
          >
            <div class="flex cursor-pointer items-center gap-2 px-3 py-1">
              @if (item.icon) {
                <i class="material-symbols-outlined">{{ item.icon }}</i>
              }
              {{ item.label }}
            </div>
          </ng-template>
        </p-menu>
        <button
          pButton
          text
          rounded
          class="size-8"
          aria-label="Add Field"
          coreTooltip="Add Field"
          tooltipPosition="top"
          (click)="openAddMenu($event)"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            add
          </i>
        </button>
      </span>
    </div>
  `,
})
export class TypeContainer {
  readonly fieldType = input.required<string>();
  readonly preset = input<FieldTypePreset>();
  readonly showActions = input(false);
  readonly addMenuChild = viewChild('addMenu', { read: Menu });

  addFieldService = inject(AddFieldService);
  dndService = inject(DNDService);
  formService = inject(CoreFormService);

  readonly addActionsWithCommand = computed<AddFieldAction[]>(() => {
    const addActions = this.addFieldService.addActions();
    return addActions.map((action) => ({
      ...action,
      command: () => this.addField({ ...action }),
    }));
  });

  readonly dragData = computed<DragData>(() => {
    return {
      action: DropAction.COPY,
      fieldType: this.fieldType(),
      fieldId: 'temp',
      preset: this.preset(),
    };
  });

  onDragStart() {
    this.dndService.setActiveDragData(this.dragData());
  }

  onDragEnd() {
    this.dndService.setActiveDragData(null);
    this.dndService.setActiveDragOverData(null);
  }

  addField(action: AddFieldAction): void {
    this.formService.addField(this.fieldType(), action.parentId, action.index, this.preset());
  }

  openAddMenu(event: MouseEvent): void {
    this.addMenuChild()?.toggle(event);
    event.preventDefault();
  }
}
