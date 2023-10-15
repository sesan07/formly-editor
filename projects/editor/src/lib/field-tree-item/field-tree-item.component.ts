import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import {
    IEditorFormlyField,
    IEditorFieldInfo,
    FieldOption,
    DragAction,
    DragType,
    IFieldDragData,
} from '../editor.types';
import { getFieldChildren } from '../form/form.utils';
import { isCategoryOption, isTypeOption, trackByFieldId } from '../editor.utils';
import { Store } from '@ngrx/store';
import { IEditorState } from '../state/state.types';
import { selectActiveField } from '../state/state.selectors';
import { DndService, DragSource, DropTarget, DropTargetMonitor } from '@ng-dnd/core';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTreeItemComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public index: number;
    @Input() public fieldOptions: FieldOption[];
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

    public isActiveField$: Observable<boolean>;
    public isExpanded$: Observable<boolean>;
    public childFields: IEditorFormlyField[] = [];
    public fieldInfo: IEditorFieldInfo;

    public dragSource: DragSource<IFieldDragData, Record<string, never>>;
    public dropTarget: DropTarget<IFieldDragData, Record<string, never>>;
    public isHovering$: Observable<boolean>;
    public hoverPosition$: Observable<'left' | 'center' | 'right'>;
    public dropWidth: { left: number; center?: number; right: number };

    trackByFieldId = trackByFieldId;
    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    private _isExpanded$: BehaviorSubject<boolean> = new BehaviorSubject(this.isExpanded);
    private _boundingRect: DOMRect;
    private _hoverPosition$: BehaviorSubject<'left' | 'center' | 'right'> = new BehaviorSubject('left');

    constructor(
        private _editorService: EditorService,
        private _store: Store<IEditorState>,
        private _dnd: DndService,
        private _ngZone: NgZone,
        private _elementRef: ElementRef<HTMLElement>
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.field) {
            this.fieldInfo = this.field._info;

            if (this.fieldInfo.childrenConfig) {
                const children = getFieldChildren(this.field);
                this.childFields = Array.isArray(children) ? children : children ? [children] : [];
            }
        }

        if (changes.isExpanded) {
            this._isExpanded$.next(this.isExpanded);
        }
    }

    ngOnInit(): void {
        this.isExpanded$ = this._isExpanded$.asObservable();
        this.isActiveField$ = this._store.select(selectActiveField).pipe(
            takeUntil(this._destroy$),
            map(field => this.fieldInfo.fieldId === field?._info.fieldId),
            tap(isActiveField => {
                if (isActiveField) {
                    this.expandParent.emit();
                }
            })
        );

        this._setupDragAndDrop();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this.dragSource.unsubscribe();
        this.dropTarget.unsubscribe();
    }

    addField = (type: string) => {
        if (this.fieldInfo.childrenConfig) {
            this._isExpanded$.next(true);
        }
        this._editorService.addField(type, this.fieldInfo.fieldId);
    };

    replaceField = (type: string) => this._editorService.replaceField(type, this.fieldInfo.fieldId);

    onRemove(): void {
        this._editorService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onSelected(): void {
        this._editorService.setActiveField(this.fieldInfo.fieldId);
    }

    onExpandParent(): void {
        this._isExpanded$.next(true);
        this.expandParent.emit();
    }

    private _setupDragAndDrop(): void {
        this.dropWidth = this.field._info.childrenConfig
            ? {
                  left: 25,
                  center: 50,
                  right: 25,
              }
            : {
                  left: 50,
                  right: 50,
              };

        this.hoverPosition$ = this._hoverPosition$.pipe(distinctUntilChanged());

        this.dragSource = this._dnd.dragSource(DragType.FORMLY_FIELD, {
            beginDrag: () => this._getDragData(),
        });

        this.dropTarget = this._dnd.dropTarget(DragType.FORMLY_FIELD, {
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

    private _getDragData(): IFieldDragData {
        return {
            action: DragAction.MOVE,
            index: this.index,
            field: this._editorService.getField(this.field._info.fieldId),
            fieldParent: this._editorService.getField(this.field._info.parentFieldId),
        };
    }

    private _canDrop(monitor: DropTargetMonitor<IFieldDragData>): boolean {
        const sourceFieldPath = monitor.getItem().field._info.fieldPath;
        const fieldPath = this.field._info.fieldPath;
        // Prevent dropping self or parent
        const invalid =
            sourceFieldPath.length <= fieldPath.length && sourceFieldPath.every((id, index) => id === fieldPath[index]);

        return monitor.isOver({ shallow: true }) && !invalid;
    }

    private _onDrop(monitor: DropTargetMonitor<IFieldDragData>): Record<string, never> {
        if (monitor.didDrop()) {
            return;
        }

        const targetParent =
            this._hoverPosition$.value === 'center'
                ? this._editorService.getField(this.field._info.fieldId)
                : this._editorService.getField(this.field._info.parentFieldId);

        const sourceData: IFieldDragData = monitor.getItem();
        const dragIndex: number = sourceData.index;
        const dropIndex: number =
            this._hoverPosition$.value === 'center'
                ? undefined
                : this._hoverPosition$.value === 'left'
                ? this.index
                : this.index + 1;

        this._ngZone.run(() => {
            switch (sourceData.action) {
                case DragAction.MOVE:
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
                : this.field._info.childrenConfig && xPercent <= this.dropWidth.left + this.dropWidth.center
                ? 'center'
                : 'right';
        this._hoverPosition$.next(position);

        if (position === 'center' && !this._isExpanded$.value) {
            this._isExpanded$.next(true);
        }
    }
}
