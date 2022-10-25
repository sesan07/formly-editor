import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CdkDragExit } from '@angular/cdk/drag-drop';
import { FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { Subject, takeUntil } from 'rxjs';

import { IEditorFormlyField, EditorTypeCategoryOption } from '../../editor.types';
import { EditorService } from '../../editor.service';
import { DroplistService } from '../droplist.service';
import { IItemDragData, DragAction } from '../droplist.types';

@Component({
    selector: 'editor-field-category',
    templateUrl: './field-category.component.html',
    styleUrls: ['./field-category.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldCategoryComponent implements OnInit, OnDestroy {
    @Input() category: EditorTypeCategoryOption;
    @Input() formId: string;
    @Input() isExpanded: boolean;

    public fields: IEditorFormlyField[];
    public previewFields: IEditorFormlyField[];
    public formGroup: FormGroup = new FormGroup({});
    public model: any = {};
    public connectedTo: string[] = [];

    private _destroy$: Subject<void> = new Subject();

    constructor(private _editorService: EditorService, private _dropListService: DroplistService) {}

    ngOnInit(): void {
        this.fields = this.category.typeOptions.map(option =>
            this._editorService.getDefaultField(this.formId, option.name, option.customName)
        );
        this.previewFields = cloneDeep(this.fields);
        this.previewFields.forEach(field => {
            field._info.fieldId = 'preview';
            field.key = 'preview';
        });

        this._dropListService.droplistIds$.pipe(takeUntil(this._destroy$)).subscribe(ids => (this.connectedTo = ids));
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    canEnter = () => false;

    getItemDragData(field: IEditorFormlyField): IItemDragData {
        return {
            action: DragAction.COPY,
            field,
        };
    }

    onDropListExited(event: CdkDragExit) {
        const field: IEditorFormlyField = event.item.data.field;
        const currIdx = this.fields.findIndex(f => f._info.fieldId === field._info.fieldId);
        this.fields.splice(currIdx + 1, 0, {
            ...field,
            _info: {
                ...field._info,
                fieldId: 'temp',
            },
        });
    }

    onDragReturned() {
        this.fields = this.fields.filter(f => f._info.fieldId !== 'temp');
    }
}
