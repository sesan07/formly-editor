import { Component, Inject, Input, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { EditorTypeCategoryOption } from '../../editor.types';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { DragAction, IItemDragData } from '../../services/field-droplist-service/field-droplist.types';
import { EDITOR_FIELD_SERVICE, IBaseEditorFormlyField, IFieldService } from '../../services/editor-service/editor.types';

@Component({
  selector: 'lib-field-category-list',
  templateUrl: './field-category-list.component.html',
  styleUrls: ['./field-category-list.component.scss']
})
export class FieldCategoryListComponent implements OnInit {

    @Input() category: EditorTypeCategoryOption;
    @Input() formId: string;

    public fields: IBaseEditorFormlyField[];
    public previewFields: IBaseEditorFormlyField[];
    public isExpanded: boolean = true;

    public get dropListIds(): string[] {
        return this._dropListService.getDropListIds(this.formId);
    }

    constructor(@Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService, private _dropListService: FieldDroplistService) { }

    ngOnInit(): void {
        this.fields = this.category.typeOptions.map(option => this._fieldService.getDefaultConfig(option.name, this.formId, option.customName));
        this.previewFields = cloneDeep(this.fields);
        this.previewFields.forEach(field => field.fieldId = 'preview');
    }

    canEnter = () => false;

    getItemDragData(field: IBaseEditorFormlyField): IItemDragData {
        return {
            action: DragAction.COPY,
            field
        };
    }

    onDropListExited(event: any) {
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
