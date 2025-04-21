import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
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
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { DndService, DragSourceDirective, DropTargetDirective } from '@ng-dnd/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { DropAction, FieldOption, IEditorFieldInfo, IEditorFormlyField } from '../editor.types';
import { isCategoryOption, isTypeOption } from '../editor.utils';
import { FieldDragDrop } from '../field-drag-drop/field-drag-drop';
import { FieldDropOverlayComponent } from '../field-drag-drop/field-drop-overlay/field-drop-overlay.component';
import { FieldNamePipe } from '../field-name/field-name.pipe';
import { getFieldChildren } from '../form/form.utils';
import { TreeItemComponent } from '../tree-item/tree-item.component';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TreeItemComponent,
        DragSourceDirective,
        DropTargetDirective,
        MatIcon,
        FieldDropOverlayComponent,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        MatMenuContent,
        NgTemplateOutlet,
        AsyncPipe,
        FieldNamePipe,
    ],
})
export class FieldTreeItemComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public index: number;
    @Input() public fieldOptions: FieldOption[];
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    @Output() public expandParent = new EventEmitter<void>();

    public isActiveField$: Observable<boolean>;
    public isExpanded$: Observable<boolean>;
    public childFields: IEditorFormlyField[] = [];
    public fieldInfo: IEditorFieldInfo;

    public dnd: FieldDragDrop;

    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$ = new Subject<void>();
    private _isExpanded$ = new BehaviorSubject<boolean>(this.isExpanded);

    constructor(
        private _editorService: EditorService,
        private _store: Store,
        private _dndService: DndService,
        private _ngZone: NgZone,
        elementRef: ElementRef<HTMLElement>
    ) {
        this.isExpanded$ = this._isExpanded$.asObservable();

        this.dnd = new FieldDragDrop(DropAction.MOVE, this._editorService, this._dndService, this._ngZone, elementRef);
        this.dnd.hoverPosition$.pipe(takeUntil(this._destroy$)).subscribe(position => {
            if (position === 'center' && !this._isExpanded$.value) {
                this._isExpanded$.next(true);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.field) {
            this.fieldInfo = this.field._info;

            if (this.fieldInfo.childrenConfig) {
                const children = getFieldChildren(this.field);
                this.childFields = Array.isArray(children) ? children : children ? [children] : [];
            }
        }

        if (changes.field || changes.index) {
            this.dnd.setup(this.field, this.index);
        }

        if (changes.isExpanded) {
            this._isExpanded$.next(this.isExpanded);
        }
    }

    ngOnInit(): void {
        const activeField$ = this._store
            .select(this._editorService.feature.selectActiveField)
            .pipe(takeUntil(this._destroy$));

        this.isActiveField$ = activeField$.pipe(map(field => this.fieldInfo.fieldId === field?._info.fieldId));

        // Expand if field is within active field path
        activeField$.pipe(filter(field => !!field)).subscribe(field => {
            const activeFieldPath = field._info.fieldPath;
            const index = activeFieldPath.indexOf(this.fieldInfo.fieldId);
            if (index >= 0 && activeFieldPath.length - index > 1) {
                this._isExpanded$.next(true);
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this.dnd.destroy();
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

    onSelected(isExpanded: boolean): void {
        this._isExpanded$.next(isExpanded);
        this._editorService.setActiveField(this.fieldInfo.fieldId);
    }
}
