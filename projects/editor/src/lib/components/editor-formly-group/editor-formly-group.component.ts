import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { DragAction, IItemDragData } from '../../services/field-droplist-service/field-droplist.types';
import { EditorService } from '../../services/editor-service/editor.service';
import { IEditorFormlyField } from '../../services/editor-service/editor.types';

@Component({
    selector: 'lib-editor-formly-group',
    templateUrl: './editor-formly-group.component.html',
    styleUrls: ['./editor-formly-group.component.scss'],
})
export class EditorFormlyGroupComponent extends FieldType<IEditorFormlyField> implements OnInit {
    @ViewChild(CdkDropList) dropList: CdkDropList;

    public dropListClasses: string;

    connectedTo: string[] = [];

    constructor(
        public editorService: EditorService,
        private _dropListService: FieldDroplistService) { super(); }

    ngOnInit(): void {
        this.dropListClasses = (this.field.fieldGroupClassName || '') + ' cdk-drop-list';

        if (this.field.formId && this.field.fieldId !== 'preview') {
            this.connectedTo = this._dropListService.getDropListIds(this.field.formId);
        }
    }

    canEnter = (drag: CdkDrag) => {
        // The drag-drop module doesn't call canEnter for the soure droplist, it's not designed for nested droplists.
        // If you try to drag out of a nested source you won't be able to drop back in the source.
        // This is because canEnter() is only called for other drop lists, so it would call canEnter() for parent, which would be true.
        // To get around that, we prevent entry into other containers if the mouse is inside the source container
        // We also use the order of the connectedTo list to check if the target container is stacked above.
        const isInDropContainer: boolean = this._isMouseInElement(drag.dropContainer.element.nativeElement);
        const index: number = this.connectedTo.indexOf(this.dropList.id);
        const dropContainerIndex: number = this.connectedTo.indexOf(drag.dropContainer.id);

        return !(isInDropContainer && dropContainerIndex < index);
    };

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

        switch(itemData.action) {
            case DragAction.COPY:
                this.editorService.addField(field.type, targetParent.formId, field.customType, targetParent.fieldId);
                break;
            case DragAction.MOVE:
                if (currentParent.fieldId === targetParent.fieldId) {
                    this.editorService.moveField(field.fieldId, field.formId, dragDrop.previousIndex, dragDrop.currentIndex);
                } else {
                    this.editorService.transferField(
                        field.fieldId,
                        field.formId,
                        currentParent.fieldId,
                        targetParent.fieldId
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

    private _isMouseInElement(droplistElement: HTMLElement): boolean {
        const rect: DOMRect = droplistElement.getBoundingClientRect();

        const isInWidth: boolean = this.editorService.mousePosition.x >= rect.left && this.editorService.mousePosition.x <= rect.right;
        const isInHeight: boolean = this.editorService.mousePosition.y >= rect.top && this.editorService.mousePosition.y <= rect.bottom;

        return isInWidth && isInHeight;
    }
}
