import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { DndService, DragSource, DropTarget, DropTargetMonitor } from '@ng-dnd/core';
import { Store } from '@ngrx/store';
import { FormlyConfig, FormlyField } from '@ngx-formly/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';

import { EditorService } from '../../editor.service';
import {
    DragAction,
    DragType,
    FieldOption,
    IEditorFieldInfo,
    IEditorFormlyField,
    IFieldDragData,
} from '../../editor.types';
import { getKeyPath, isCategoryOption, isTypeOption } from '../../editor.utils';
import { selectActiveForm } from '../../state/state.selectors';
import { IEditorState } from '../../state/state.types';
import { FormlyFieldTemplates } from '../formly.template';

@Component({
    selector: 'editor-root-formly-field',
    template: '<ng-template #container></ng-template>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootFormlyFieldComponent extends FormlyField {}

@Component({
    selector: 'editor-formly-field',
    templateUrl: './formly-field.component.html',
    styleUrls: ['./formly-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyFieldComponent extends FormlyField implements OnInit, OnDestroy {
    @Input() override field: IEditorFormlyField;
    @Input() public index: number;
    @Input() public isFirstChild: boolean;
    @Input() public isLastChild: boolean;

    public isEditMode$: Observable<boolean>;
    public isActiveField$: Observable<boolean>;

    public isMouseInside: boolean;
    public hideOptions: boolean;
    public fieldInfo: IEditorFieldInfo;
    public fieldOptions: FieldOption[];

    public dragSource: DragSource<IFieldDragData, Record<string, never>>;
    public dropTarget: DropTarget<IFieldDragData, Record<string, never>>;
    public isHovering$: Observable<boolean>;
    public hoverPosition$: Observable<'left' | 'center' | 'right'>;
    public dropWidth: { left: number; center?: number; right: number };

    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    // Base class has a private _elementRef
    private _elementRef2: ElementRef<HTMLElement>;
    private _boundingRect: DOMRect;
    private _hoverPosition$: BehaviorSubject<'left' | 'center' | 'right'> = new BehaviorSubject('left');

    constructor(
        private _editorService: EditorService,
        private _store: Store<IEditorState>,
        private _dnd: DndService,
        private _ngZone: NgZone,
        config: FormlyConfig,
        renderer: Renderer2,
        elementRef: ElementRef,
        hostContainerRef: ViewContainerRef,
        @Optional() form: FormlyFieldTemplates
    ) {
        super(config, renderer, elementRef, hostContainerRef, form);
        this._elementRef2 = elementRef;
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this._editorService.setActiveField(this.fieldInfo.fieldId);
        event.stopPropagation();
    }

    @HostListener('mouseover', ['$event'])
    onMouseOver(event: MouseEvent): void {
        this.isMouseInside = true;
        event.stopPropagation();
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(): void {
        this.isMouseInside = false;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.fieldInfo = this.field._info;

        this.hideOptions = this.field.templateOptions.hideEditorWrapperOptions;
        this.fieldOptions = this._editorService.fieldOptions;

        if (this.field.key) {
            this._editorService.registerKeyPath(this.field, getKeyPath(this.field.formControl));
        }

        const activeForm$ = this._store.select(selectActiveForm).pipe(
            takeUntil(this._destroy$),
            filter(form => form?.id === this.fieldInfo.formId)
        );
        this.isEditMode$ = activeForm$.pipe(map(form => form.isEditMode));
        this.isActiveField$ = activeForm$.pipe(map(form => form.activeFieldId === this.fieldInfo.fieldId));

        this._setupDragAndDrop();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroy$.next();
        this._destroy$.complete();
        this.dragSource.unsubscribe();
        this.dropTarget.unsubscribe();
    }

    addField = (type: string) => this._editorService.addField(type, this.fieldInfo.fieldId);
    replaceField = (type: string) => this._editorService.replaceField(type, this.fieldInfo.fieldId);

    onRemove(): void {
        this._editorService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onMoveUp(): void {
        const sourceField: IEditorFormlyField = this._editorService.getField(this.field._info.fieldId);
        const sourceParent: IEditorFormlyField = this._editorService.getField(this.field._info.parentFieldId);
        this._editorService.moveField(sourceField, sourceParent, sourceParent, this.index, this.index - 1);
    }

    onMoveDown(): void {
        const sourceField: IEditorFormlyField = this._editorService.getField(this.field._info.fieldId);
        const sourceParent: IEditorFormlyField = this._editorService.getField(this.field._info.parentFieldId);
        this._editorService.moveField(sourceField, sourceParent, sourceParent, this.index, this.index + 2);
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
            .subscribe(() => (this._boundingRect = this._elementRef2.nativeElement.getBoundingClientRect()));
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
    }
}
