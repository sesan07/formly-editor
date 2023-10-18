import { ElementRef, NgZone } from '@angular/core';
import { DndService, DragSource, DropTarget, DropTargetMonitor } from '@ng-dnd/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, takeUntil } from 'rxjs';

import { EditorService } from '../editor.service';
import { DropAction, DragType, IEditorFormlyField } from '../editor.types';
import { FieldDropPosition, FieldDropWidth, IFieldDragData } from './field-drag-drop.types';

export class FieldDragDrop {
    public dragSource: DragSource<IFieldDragData, Record<string, never>>;
    public dropTarget: DropTarget<IFieldDragData, Record<string, never>>;
    public isHovering$: Observable<boolean>;
    public hoverPosition$: Observable<FieldDropPosition>;
    public dropWidth: FieldDropWidth;

    private _field: IEditorFormlyField;
    private _index: number;
    private _isDropTarget: boolean;
    private _destroy$: Subject<void> = new Subject();
    private _boundingRect: DOMRect;
    private _hoverPosition$: BehaviorSubject<FieldDropPosition> = new BehaviorSubject('left');

    constructor(
        private _action: DropAction,
        private _editorService: EditorService,
        private _dndService: DndService,
        private _ngZone?: NgZone,
        private _elementRef?: ElementRef<HTMLElement>
    ) {
        this._isDropTarget = !!(_ngZone && _elementRef);
        this._setupDragAndDrop();
    }

    public setup(field: IEditorFormlyField, index?: number) {
        this._field = field;
        this._index = index;

        if (this._isDropTarget) {
            this.dropWidth = this._field._info.childrenConfig
                ? {
                      left: 25,
                      center: 50,
                      right: 25,
                  }
                : {
                      left: 50,
                      right: 50,
                  };
        }
    }

    destroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this.dragSource.unsubscribe();
        this.dropTarget?.unsubscribe();
    }

    private _setupDragAndDrop(): void {
        this.hoverPosition$ = this._hoverPosition$.pipe(distinctUntilChanged());

        this.dragSource = this._dndService.dragSource(DragType.FORMLY_FIELD, {
            beginDrag: () => this._getDragData(),
        });

        if (this._isDropTarget) {
            this.dropTarget = this._dndService.dropTarget(DragType.FORMLY_FIELD, {
                canDrop: monitor => this._canDrop(monitor),
                drop: monitor => this._onDrop(monitor),
                hover: monitor => this._onHover(monitor),
            });

            this.isHovering$ = this.dropTarget.listen(monitor => monitor.canDrop());
            this.dropTarget
                .listen(monitor => monitor.canDrop())
                .pipe(takeUntil(this._destroy$))
                .subscribe(() => (this._boundingRect = this._elementRef.nativeElement.getBoundingClientRect()));
        }
    }

    private _getDragData(): IFieldDragData {
        return {
            action: this._action,
            index: this._index,
            field: this._field,
            fieldParent: this._editorService.getField(this._field._info?.parentFieldId),
        };
    }

    private _canDrop(monitor: DropTargetMonitor<IFieldDragData>): boolean {
        if (!monitor.isOver({ shallow: true })) {
            return false;
        }

        if (monitor.getItem().action === DropAction.COPY) {
            return true;
        }

        const sourceFieldPath = monitor.getItem().field._info.fieldPath;
        const fieldPath = this._field._info.fieldPath;
        // Prevent dropping self or parent
        const invalid =
            sourceFieldPath.length <= fieldPath.length && sourceFieldPath.every((id, index) => id === fieldPath[index]);

        return !invalid;
    }

    private _onDrop(monitor: DropTargetMonitor<IFieldDragData>): Record<string, never> {
        if (monitor.didDrop()) {
            return;
        }

        const targetParent =
            this._hoverPosition$.value === 'center'
                ? this._field
                : this._editorService.getField(this._field._info.parentFieldId);

        const sourceData: IFieldDragData = monitor.getItem();
        const dragIndex: number = sourceData.index;
        const dropIndex: number =
            this._hoverPosition$.value === 'center'
                ? undefined
                : this._hoverPosition$.value === 'left'
                ? this._index
                : this._index + 1;

        this._ngZone.run(() => {
            switch (sourceData.action) {
                case DropAction.COPY:
                    this._editorService.addField(sourceData.field.type, targetParent?._info.fieldId, dropIndex);
                    break;
                case DropAction.MOVE:
                    this._editorService.moveField(
                        sourceData.field,
                        sourceData.fieldParent,
                        targetParent,
                        dragIndex,
                        dropIndex
                    );
                    break;
            }
        });
        return {};
    }

    private _onHover(monitor: DropTargetMonitor<IFieldDragData>): void {
        if (!(this._boundingRect && monitor.canDrop())) {
            return;
        }

        const mousePosition = monitor.getClientOffset();
        const xDelta = mousePosition.x - this._boundingRect.x;
        const xPercent = (xDelta / this._boundingRect.width) * 100;
        const position =
            xPercent <= this.dropWidth.left
                ? 'left'
                : this._field._info.childrenConfig && xPercent <= this.dropWidth.left + this.dropWidth.center
                ? 'center'
                : 'right';
        this._hoverPosition$.next(position);
    }
}
