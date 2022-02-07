import { Injectable } from '@angular/core';
import { IBaseEditorFormlyField } from '../form-service/form.types';
import { FormService } from './../form-service/form.service';

@Injectable({
  providedIn: 'root'
})
export class FieldDroplistService {

    private _formDropListIdMap: Map<string, string[]> = new Map();  // Map<formId, dropListIds[]>

    constructor(private _formService: FormService) {}

    getDropListIds(formId: string): string[] {
        return this._formDropListIdMap.get(formId).slice();
    }

    resetDropListIds(formId: string): void {
        const levelList: IBaseEditorFormlyField[][] = [];
        const dropListIds: string[] = [];

        const form = this._formService.getForm(formId);
        form.fields.forEach(field => {
            this._addField(field, levelList, 0)
        })

        levelList.forEach(level => {
            level.forEach(field => dropListIds.push(field.fieldId))
        })
        
        this._formDropListIdMap.set(formId, dropListIds.reverse());
    }

    private _addField(field: IBaseEditorFormlyField, levelList: IBaseEditorFormlyField[][], level: number): void {
        if (field.canHaveChildren) {
            const children: IBaseEditorFormlyField[] = this._formService.getChildren(field);
            children.forEach(child => {
                this._addField(child, levelList, level + 1)
            });

            if (!levelList[level]) {
                levelList[level] = [field];
            } else {
                levelList[level].push(field)
            }
        }
    }
}
