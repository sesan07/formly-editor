import { CdkDragDrop, DropListOrientation } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { filter, Subject, takeUntil } from 'rxjs';

import { DroplistService } from '../../form/droplist.service';
import { IItemDragData, DragAction } from '../../form/droplist.types';
import { EditorService } from '../../editor.service';
import { IEditorFormlyField } from '../../editor.types';
import { trackByFieldId } from '../../editor.utils';
import { Store } from '@ngrx/store';
import { IEditorState } from '../../state/state.types';
import { selectActiveForm } from '../../state/state.selectors';

@Component({
    selector: 'editor-formly-group',
    templateUrl: './formly-group.component.html',
    styleUrls: ['./formly-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyGroupComponent extends FieldType<IEditorFormlyField> implements OnInit, OnDestroy {
    public dropListClasses: string;
    public dropListOrientation: DropListOrientation;
    public connectedTo: string[] = [];
    public isGridContainer: boolean;
    public isEditMode: boolean;

    trackByFieldId = trackByFieldId;

    private _destroy$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _droplistService: DroplistService,
        private _cdRef: ChangeDetectorRef,
        private _store: Store<IEditorState>
    ) {
        super();
    }

    ngOnInit(): void {
        if (!this.field._info) {
            return;
        }

        this.dropListClasses = this.field.fieldGroupClassName ?? '';

        // const hasGrid: boolean = this._hasFieldGroupClassName(ContainerType.GRID);
        // const hasFlex: boolean = this._hasFieldGroupClassName(ContainerType.FLEX);

        // const isHorizontal: boolean =
        //     hasFlex &&
        //     !(
        //         this._hasFieldGroupClassName(FlexContainerType.COMLUMN) ||
        //         this._hasFieldGroupClassName(FlexContainerType.COMLUMN_REVERSE)
        //     );

        // this.isGridContainer = hasGrid;
        // this.dropListOrientation = !hasGrid && isHorizontal ? 'horizontal' : 'vertical';

        if (this.field._info.formId && this.field._info.fieldId !== 'preview') {
            this._droplistService.droplistIds$
                .pipe(takeUntil(this._destroy$))
                .subscribe(ids => (this.connectedTo = ids));
        }

        this._store
            .select(selectActiveForm)
            .pipe(
                takeUntil(this._destroy$),
                filter(form => form && form.id === this.field._info.formId)
            )
            .subscribe(form => {
                this.isEditMode = form.isEditMode;
                this._cdRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    // TODO support dragging(copy, not move) between forms? :D
    onDroplistDropped(dragDrop: CdkDragDrop<IEditorFormlyField>): void {
        if (!dragDrop.isPointerOverContainer) {
            console.warn('Pointer is not over container. Not dropping');
            return;
        }

        const itemData: IItemDragData = dragDrop.item.data;
        const field: IEditorFormlyField = itemData.field;
        const currentParent: IEditorFormlyField = dragDrop.previousContainer.data;
        const targetParent: IEditorFormlyField = dragDrop.container.data;

        const dropIndex: number = this.isGridContainer ? undefined : dragDrop.currentIndex;

        switch (itemData.action) {
            case DragAction.COPY:
                this._editorService.addField(field.type, field.customType, targetParent._info.fieldId, dropIndex);
                break;
            case DragAction.MOVE:
                if (currentParent._info.fieldId === targetParent._info.fieldId) {
                    if (dragDrop.previousIndex === dragDrop.currentIndex) {
                        return;
                    }
                    this._editorService.moveField(field._info.fieldId, dragDrop.previousIndex, dropIndex);
                } else {
                    this._editorService.transferField(
                        field._info.fieldId,
                        targetParent._info.fieldId,
                        dragDrop.previousIndex,
                        dropIndex
                    );
                }
                break;
        }
    }

    getItemDragData(field: IEditorFormlyField): IItemDragData {
        return {
            action: DragAction.MOVE,
            field,
        };
    }

    private _hasFieldGroupClassName(className: string): boolean {
        const regex = new RegExp(`(?<!-)${className}(?!-)`);
        return !!this.field.fieldGroupClassName?.match(regex);
    }
}
