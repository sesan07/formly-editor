import { Injectable } from '@angular/core';
import { IBaseEditorFormlyField } from '../editor-service/editor.types';
import { EditorService } from '../editor-service/editor.service';

@Injectable({
  providedIn: 'root'
})
export class FieldDroplistService {

    private _formDropListIdMap: Map<string, string[]> = new Map();  // Map<formId, dropListIds[]>

    constructor(private _editorService: EditorService) {}

    getDropListIds(formId: string): string[] {
        return this._formDropListIdMap.get(formId).slice();
    }

    resetDropListIds(formId: string): void {
        const levelList: IBaseEditorFormlyField[][] = [];
        const dropListIds: string[] = [];

        const form = this._editorService.getForm(formId);
        form.fields.forEach(field => {
            this._addField(field, levelList, 0);
        });

        levelList.forEach(level => {
            level.forEach(field => dropListIds.push(field.fieldId));
        });

        this._formDropListIdMap.set(formId, dropListIds.reverse());
    }

    private _addField(field: IBaseEditorFormlyField, levelList: IBaseEditorFormlyField[][], level: number): void {
        if (field.canHaveChildren) {
            const children: IBaseEditorFormlyField[] = this._editorService.getChildren(field);
            children.forEach(child => {
                this._addField(child, levelList, level + 1);
            });

            if (!levelList[level]) {
                levelList[level] = [field];
            } else {
                levelList[level].push(field);
            }
        }
    }
}
