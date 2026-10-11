import { CoreFormService } from '../editor/core-form.service';
import { CoreFieldService } from '../config/core-field.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { DndDraggableDirective, DndDropzoneDirective, DndHandleDirective } from 'ngx-drag-drop';
import { DNDService } from '../editor/dnd.service';
import { EditorField, FieldInfo } from '../model/types';
import { DropAction, FieldDropPosition } from '../editor/types';
import { FormlyFieldHeader } from './formly-field-header';
import { FormlyFieldOverlay } from './formly-field-overlay';

@Component({
  selector: 'core-field-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DndDraggableDirective,
    DndDropzoneDirective,
    DndHandleDirective,
    FormlyFieldHeader,
    FormlyFieldOverlay,
  ],
  host: {
    class: 'block',
    '[id]': 'fieldInfo.id',
    '[tabindex]': '0',
    '[attr.aria-label]': "'Field ' + fieldInfo.id",
    '[attr.aria-pressed]': 'isActiveField()',
    '(mouseenter)': 'setMouseEntered()',
    '(mouseleave)': 'setMouseLeft()',
    '(click)': 'onFieldClick($event)',
    '(keydown.enter)': 'onFieldKeydown($event)',
    '(keydown.space)': 'onFieldKeydown($event)',
  },
  template: `
    <div
      dndDropzone
      [class]="'relative rounded-sm border-2 transition-[border-color] ' + this.borderColor()"
      (dndDragover)="onDragover($event)"
      (dndDrop)="onDrop()"
    >
      <div
        class="h-full w-full"
        dndDraggable
        dndEffectAllowed="move"
        [dndDisableIf]="!isDraggable"
        (dndStart)="onDragStart()"
        (dndEnd)="onDragEnd()"
      >
        <core-formly-field-header
          dndHandle
          [field]="field"
          [fieldInfo]="fieldInfo"
          [fieldKey]="field.key"
          [isMouseInside]="isMouseInside()"
        />

        <div
          class="p-1"
          [class.py-8]="showExpandedDropzone()"
        >
          <ng-template #fieldComponent />
        </div>

        <core-formly-field-overlay
          [canDrop]="canDrop()"
          [hoverPosition]="hoverPosition()"
          [showCenter]="fieldInfo.isParent"
          [showSides]="!fieldInfo.isRoot"
        />
      </div>
    </div>
  `,
})
export class CoreFieldWrapper extends FieldWrapper<EditorField> implements OnInit, OnDestroy {
  formService = inject(CoreFormService);
  fieldService = inject(CoreFieldService);
  // isPreviewMode = inject(CORE_PREVIEW_MODE, { optional: true });
  dndService = inject(DNDService);
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  fieldInfo!: FieldInfo;
  isDraggable!: boolean;

  readonly isActiveField = computed(() => {
    return this.formService.activeFieldId() === this.fieldInfo.id;
  });
  readonly isMouseInside = computed(() => {
    return this.formService.activeMouseInside() === this.fieldInfo.id;
  });

  readonly borderColor = computed(() => {
    if (this.isActiveField()) {
      return 'border-primary/70';
    }
    if (this.isMouseInside()) {
      return 'border-primary/30';
    }
    return 'border-transparent';
  });

  fieldOptions = this.fieldService.activeFieldCategoryOptions;

  readonly boundingRect = computed(() => {
    this.dndService.activeDragData();
    return this.elementRef.nativeElement.getBoundingClientRect();
  });

  readonly canDrop = computed(() => {
    const activeDragData = this.dndService.activeDragData();
    if (!activeDragData) return false;

    if (activeDragData.action === DropAction.COPY) return true;

    return !this.fieldInfo.idPath.includes(activeDragData.fieldId);
  });

  readonly showExpandedDropzone = computed(() => {
    const activeDragData = this.dndService.activeDragData();
    if (!activeDragData) return false;

    return (
      this.fieldInfo.isParent &&
      !this.fieldInfo.isRoot &&
      !(!!this.field.fieldGroup?.length || Object.keys(this.field.fieldArray ?? {}).length)
    );
  });

  readonly hoverPosition = computed<FieldDropPosition | null>(() => {
    const activeDragOverData = this.dndService.activeDragOverData();
    if (!activeDragOverData || activeDragOverData.fieldId !== this.fieldInfo.id) {
      return null;
    }

    const xDelta = activeDragOverData.clientX - this.boundingRect().x;
    const xPercent = (xDelta / this.boundingRect().width) * 100;

    if (this.fieldInfo.isParent) {
      if (this.fieldInfo.isRoot) {
        return 'center';
      }
      return xPercent <= 33 ? 'left' : xPercent >= 67 ? 'right' : 'center';
    }
    return xPercent <= 50 ? 'left' : 'right';
  });

  ngOnInit(): void {
    this.fieldInfo = this.formService.getField(this.field._info.id)!._info;
    this.isDraggable = !this.fieldInfo.isRoot;
  }

  ngOnDestroy(): void {
    this.setMouseLeft();
  }

  onDragStart() {
    this.dndService.setActiveDragData({
      action: DropAction.MOVE,
      fieldType: this.field.type as string,
      fieldId: this.fieldInfo.id,
      index: this.formService.getFieldIndex(this.fieldInfo.id),
    });
  }

  onDragover(event: DragEvent) {
    this.dndService.setActiveDragOverData({
      fieldId: this.fieldInfo.id,
      clientX: event.clientX,
    });
    event.preventDefault();
  }

  onDrop() {
    const dragData = this.dndService.activeDragData();
    if (!dragData || !this.canDrop()) {
      return;
    }

    const index = this.formService.getFieldIndex(this.fieldInfo.id);
    if (index < 0) {
      throw new Error('Unable to determine field index');
    }

    let targetParentId: string | undefined;
    let targetIndex: number | undefined;

    if (this.hoverPosition() === 'center') {
      targetParentId = this.fieldInfo.id;
      targetIndex = undefined;
    } else {
      targetParentId = this.fieldInfo.idPath[this.fieldInfo.idPath.length - 2];
      targetIndex = this.hoverPosition() === 'left' ? index : index + 1;
    }

    if (dragData.action === DropAction.COPY) {
      this.formService.addField(dragData.fieldType, targetParentId, targetIndex, dragData.preset);
    } else if (dragData.action === DropAction.MOVE) {
      const sourceIndex = dragData.index;
      if (typeof sourceIndex !== 'number') {
        throw new Error('Unable to determine source field index');
      }

      this.formService.moveField(dragData.fieldId, sourceIndex, targetIndex, targetParentId);
    }
  }

  onDragEnd() {
    this.dndService.setActiveDragData(null);
    this.dndService.setActiveDragOverData(null);
  }

  setActiveField() {
    this.formService.setActiveField(this.fieldInfo.id);
  }

  onFieldClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const nearestWrapper = target.closest('core-field-wrapper');
    if (nearestWrapper !== event.currentTarget) {
      return;
    }

    this.setActiveField();
  }

  onFieldKeydown(event: Event) {
    if (
      event.defaultPrevented ||
      this.elementRef.nativeElement.ownerDocument.activeElement !== this.elementRef.nativeElement
    ) {
      return;
    }

    event.preventDefault();
    this.setActiveField();
  }

  setMouseEntered() {
    this.formService.setMouseEnteredField(this.fieldInfo.id);
  }

  setMouseLeft() {
    this.formService.setMouseLeftField(this.fieldInfo.id);
  }
}
