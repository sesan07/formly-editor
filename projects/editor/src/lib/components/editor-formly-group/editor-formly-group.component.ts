import { CdkDrag, CdkDragDrop, CdkDropList, DropListOrientation } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { EditorWrapperService } from '../../services/editor-wrapper-service/editor-wrapper.service';
import { DragAction, IItemDragData } from '../../services/field-droplist-service/field-droplist.types';
import { FormService } from '../../services/form-service/form.service';
import { IBaseEditorFormlyField } from '../../services/form-service/form.types';
import { MouseService } from '../../services/mouse-service/mouse.service';

@Component({
    selector: 'app-editor-formly-group',
    templateUrl: './editor-formly-group.component.html',
    styleUrls: ['./editor-formly-group.component.scss'],
})
export class EditorFormlyGroupComponent extends FieldType<IBaseEditorFormlyField> implements AfterViewInit {
    @ViewChild(CdkDropList) dropList: CdkDropList;

    get dropListClasses(): string { return (this.field.fieldGroupClassName || '') + ' cdk-drop-list'; }
    get dropListOrientation(): DropListOrientation {
        return this.dropListClasses.includes('flex') && !this.dropListClasses.includes('flex-column')
            ? 'horizontal' as DropListOrientation
            : 'vertial'  as DropListOrientation;
    }

    connectedTo: string[] = [];

    constructor(private _formService: FormService, public wrapperService: EditorWrapperService, private _mouseService: MouseService) { super(); }

    ngAfterViewInit(): void {
        this._addConnection(this.field, new Set());
    }

    canEnter = (drag: CdkDrag) => {
        // The drag-drop module doesn't seem to allow dragging back into the source container
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
                this._formService.addField(field.type, targetParent.formId, field.customType, targetParent.fieldId, dragDrop.currentIndex);
                break;
            case DragAction.MOVE:
                if (currentParent.fieldId === targetParent.fieldId) {
                    this._formService.moveField(field.fieldId, field.formId, dragDrop.previousIndex, dragDrop.currentIndex);
                } else {
                    this._formService.transferField(
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

    private _addConnection(field: IBaseEditorFormlyField, visited: Set<string>) {
        visited.add(field.fieldId);

        if (field.canHaveChildren) {
            const children: IBaseEditorFormlyField[] = this._formService.getChildren(field);
            children.forEach(child => {
                if (!visited.has(child.fieldId)) {
                    this._addConnection(child, visited);
                }
            });

            // Only connect to fields with children
            this.connectedTo.push(field.fieldId);
        }

        if (field.parentFieldId && !visited.has(field.parentFieldId)) {
            const parent: IBaseEditorFormlyField = this._formService.getField(field.formId, field.parentFieldId);
            this._addConnection(parent, visited);
        }
    }

    private _isMouseInElement(droplistElement: HTMLElement): boolean {
        const rect: DOMRect = droplistElement.getBoundingClientRect();

        const isInWidth: boolean = this._mouseService.position.x >= rect.left && this._mouseService.position.x <= rect.right;
        const isInHeight: boolean = this._mouseService.position.y >= rect.top && this._mouseService.position.y <= rect.bottom;

        return isInWidth && isInHeight;
    }
}
