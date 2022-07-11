import { CdkDragDrop, DropListOrientation } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';

import { FieldDroplistService } from '../../../services/field-droplist-service/field-droplist.service';
import { DragAction, IItemDragData } from '../../../services/field-droplist-service/field-droplist.types';
import { EditorService } from '../../../services/editor-service/editor.service';
import { IEditorFormlyField, IForm } from '../../../services/editor-service/editor.types';
import { ContainerType, FlexContainerType } from '../../../services/style-service/style.types';

@Component({
    selector: 'editor-formly-group',
    templateUrl: './formly-group.component.html',
    styleUrls: ['./formly-group.component.scss'],
})
export class FormlyGroupComponent extends FieldType<IEditorFormlyField> implements OnInit, OnDestroy {
    public dropListClasses: string;
    public dropListOrientation: DropListOrientation;
    public connectedTo: string[] = [];
    public isGridContainer: boolean;
    public isEditMode: boolean;

    private _form: IForm;
    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _dropListService: FieldDroplistService
    ) { super(); }

    ngOnInit(): void {
        this.dropListClasses = this.field.fieldGroupClassName ? this.field.fieldGroupClassName : '';

        const hasGrid: boolean = this._hasFieldGroupClassName(ContainerType.GRID);
        const hasFlex: boolean = this._hasFieldGroupClassName(ContainerType.FLEX);

        const isHorizontal: boolean = hasFlex && !(
            this._hasFieldGroupClassName(FlexContainerType.COMLUMN) ||
            this._hasFieldGroupClassName(FlexContainerType.COMLUMN_REVERSE)
        );

        this.isGridContainer = hasGrid;
        this.dropListOrientation = !hasGrid && isHorizontal ? 'horizontal' : 'vertical';

        if (this.field.formId && this.field.fieldId !== 'preview') {
            this._dropListService.getDropListIds$(this.field.formId)
                .pipe(takeUntil(this._destroy$))
                .subscribe(ids => this.connectedTo = ids);
        }

        this._form = this.editorService.getForm(this.field.formId);
        this._form?.isEditMode$
            .pipe(takeUntil(this._destroy$))
            .subscribe(v => this.isEditMode = v);
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

        switch(itemData.action) {
            case DragAction.COPY:
                this.editorService.addField(field.type, targetParent.formId, field.customType, targetParent.fieldId, dropIndex);
                break;
            case DragAction.MOVE:
                if (currentParent.fieldId === targetParent.fieldId) {
                    if (dragDrop.previousIndex === dragDrop.currentIndex) {
                        return;
                    }
                    this.editorService.moveField(field.fieldId, field.formId, dragDrop.previousIndex, dropIndex);
                } else {
                    this.editorService.transferField(
                        field.fieldId,
                        field.formId,
                        targetParent.fieldId,
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
            field
        };
    }

    private _hasFieldGroupClassName(className: string): boolean {
        const regex = new RegExp(`(?<!-)${className}(?!-)`);
        return !!this.field.fieldGroupClassName?.match(regex);
    }
}
