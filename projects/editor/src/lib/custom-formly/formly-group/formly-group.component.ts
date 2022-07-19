import { CdkDragDrop, DropListOrientation } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';

import { DroplistService } from '../../form/droplist.service';
import { IItemDragData, DragAction } from '../../form/droplist.types';
import { FormService } from '../../form/form.service';
import { EditorService } from '../../editor.service';
import { IEditorFormlyField } from '../../editor.types';
import { ContainerType, FlexContainerType } from '../../edit-field/styles/styles.types';

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

    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _formService: FormService,
        private _droplistService: DroplistService
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
            this._droplistService.droplistIds$
                .pipe(takeUntil(this._destroy$))
                .subscribe(ids => this.connectedTo = ids);
        }

        this._formService.isEditMode$
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
                this._formService.addField(field.type, field.customType, targetParent.fieldId, dropIndex);
                break;
            case DragAction.MOVE:
                if (currentParent.fieldId === targetParent.fieldId) {
                    if (dragDrop.previousIndex === dragDrop.currentIndex) {
                        return;
                    }
                    this._formService.moveField(field.fieldId, dragDrop.previousIndex, dropIndex);
                } else {
                    this._formService.transferField(
                        field.fieldId,
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
