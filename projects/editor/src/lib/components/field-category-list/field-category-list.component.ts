import { Component, Inject, Input, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { DragAction, IItemDragData } from '../../services/field-droplist-service/field-droplist.types';
import { IEditorFormlyField, EditorTypeCategoryOption } from '../../services/editor-service/editor.types';
import { EditorService } from '../../services/editor-service/editor.service';
import { CdkDragExit } from '@angular/cdk/drag-drop';

@Component({
    selector: 'lib-field-category-list',
    templateUrl: './field-category-list.component.html',
    styleUrls: ['./field-category-list.component.scss']
})
export class FieldCategoryListComponent implements OnInit {

    @Input() category: EditorTypeCategoryOption;
    @Input() formId: string;
    @Input() isExpanded: boolean;

    public fields: IEditorFormlyField[];
    public previewFields: IEditorFormlyField[];

    public get dropListIds(): string[] {
        return this._dropListService.getDropListIds(this.formId);
    }

    constructor(private _editorService: EditorService, private _dropListService: FieldDroplistService) { }

    ngOnInit(): void {
        this.fields = this.category.typeOptions.map(option =>
            this._editorService.getDefaultConfig(this.formId, option.name, option.customName)
        );
        this.previewFields = cloneDeep(this.fields);
        this.previewFields.forEach(field => field.fieldId = 'preview');
    }

    canEnter = () => false;

    getItemDragData(field: IEditorFormlyField): IItemDragData {
        return {
            action: DragAction.COPY,
            field
        };
    }

    onDropListExited(event: CdkDragExit) {
        const currentIdx = this.fields.findIndex(f => f.fieldId === event.item.data.field.fieldId);
        this.fields.splice(currentIdx + 1, 0, {
            ...event.item.data.field,
            fieldId: 'temp',
        });
    }
    onDragReturned() {
        this.fields = this.fields.filter((f) => f.fieldId !== 'temp');
    }

}
