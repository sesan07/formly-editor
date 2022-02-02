import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { EditorWrapperService } from 'src/app/editor/services/editor-wrapper-service/editor-wrapper.service';
import { FormService } from 'src/app/editor/services/form-service/form.service';
import { IBaseEditorFormlyField } from 'src/app/editor/services/form-service/form.types';

@Component({
    selector: 'app-editor-formly-group',
    templateUrl: './editor-formly-group.component.html',
    styleUrls: ['./editor-formly-group.component.scss'],
})
export class EditorFormlyGroupComponent extends FieldType<IBaseEditorFormlyField> implements AfterViewInit {
    @ViewChild(CdkDropList) dropList: CdkDropList;

    get classes() { return (this.field.fieldGroupClassName || '') + ' droplist'; }

    connectedTo: string[] = [];
    mousePosition: {x: number; y: number} = {x:0, y:0};

    constructor(private _formService: FormService, public wrapperService: EditorWrapperService) { super(); }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
    }

    ngAfterViewInit(): void {
        if (this.classes.includes('flex') && !this.classes.includes('flex-column')) {
            this.dropList.orientation = 'horizontal';
        }

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

        // These are copies of the fields, only use their ids
        const field: IBaseEditorFormlyField = dragDrop.item.data;
        const currentParent: IBaseEditorFormlyField = dragDrop.previousContainer.data;
        const targetParent: IBaseEditorFormlyField = dragDrop.container.data;

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
    }

    private _addConnection(field: IBaseEditorFormlyField, visited: Set<string>) {
        visited.add(field.fieldId);

        if (this._formService.canHaveChildren(field)) {
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

        const isInWidth: boolean = this.mousePosition.x >= rect.left && this.mousePosition.x <= rect.right;
        const isInHeight: boolean = this.mousePosition.y >= rect.top && this.mousePosition.y <= rect.bottom;

        return isInWidth && isInHeight;
    }
}
