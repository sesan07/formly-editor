import { CdkDrag, CdkDragDrop, CdkDropList, DropListOrientation } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { DragAction, IItemDragData } from '../../services/field-droplist-service/field-droplist.types';
import { FormService } from '../../services/form-service/form.service';
import { IBaseEditorFormlyField } from '../../services/form-service/form.types';
import { MouseService } from '../../services/mouse-service/mouse.service';

@Component({
    selector: 'app-editor-formly-group',
    templateUrl: './editor-formly-group.component.html',
    styleUrls: ['./editor-formly-group.component.scss'],
})
export class EditorFormlyGroupComponent extends FieldType<IBaseEditorFormlyField> implements OnInit {
    @ViewChild(CdkDropList) dropList: CdkDropList;

    get dropListClasses(): string { return (this.field.fieldGroupClassName || '') + ' cdk-drop-list'; }
    get dropListOrientation(): DropListOrientation {
        return this.dropListClasses.includes('flex') && !this.dropListClasses.includes('flex-column')
            ? 'horizontal' as DropListOrientation
            : 'vertial'  as DropListOrientation;
    }

    connectedTo: string[] = [];

    constructor(
        public formService: FormService,
        private _mouseService: MouseService,
        private _dropListService: FieldDroplistService) { super(); }

    ngOnInit(): void {
        if (this.field.fieldId !== 'preview') {
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
    onDroplistDropped(dragDrop: CdkDragDrop<IBaseEditorFormlyField>): void {
        if (!dragDrop.isPointerOverContainer) {
            console.warn('Pointer is not over container. Not dropping');
            return;
        }

        const itemData: IItemDragData = dragDrop.item.data;
        const field: IBaseEditorFormlyField = itemData.field;
        const currentParent: IBaseEditorFormlyField = dragDrop.previousContainer.data;
        const targetParent: IBaseEditorFormlyField = dragDrop.container.data;

        switch(itemData.action) {
            case DragAction.COPY:
                this.formService.addField(field.type, targetParent.formId, field.customType, targetParent.fieldId, dragDrop.currentIndex);
                break;
            case DragAction.MOVE:
                if (currentParent.fieldId === targetParent.fieldId) {
                    this.formService.moveField(field.fieldId, field.formId, dragDrop.previousIndex, dragDrop.currentIndex);
                } else {
                    this.formService.transferField(
                        field.fieldId,
                        field.formId,
                        currentParent.fieldId,
                        targetParent.fieldId,
                        dragDrop.previousIndex,
                        dragDrop.currentIndex
                    );
                }
                break;
        }
    }

    getItemDragData(field: IBaseEditorFormlyField): IItemDragData {
        return {
            action: DragAction.MOVE,
            field
        };
    }

    private _isMouseInElement(droplistElement: HTMLElement): boolean {
        const rect: DOMRect = droplistElement.getBoundingClientRect();

        const isInWidth: boolean = this._mouseService.position.x >= rect.left && this._mouseService.position.x <= rect.right;
        const isInHeight: boolean = this._mouseService.position.y >= rect.top && this._mouseService.position.y <= rect.bottom;

        return isInWidth && isInHeight;
    }
}
