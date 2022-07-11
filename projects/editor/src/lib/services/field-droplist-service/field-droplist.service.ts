import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IEditorFormlyField, IForm } from '../editor-service/editor.types';
import { getChildren } from '../../utils';

@Injectable()
export class FieldDroplistService {

    private _formDropListIdMap: Map<string, BehaviorSubject<string[]>> = new Map();

    getDropListIds$(formId: string): Observable<string[]> {
        return this._formDropListIdMap.get(formId);
    }

    updateDropListIds(form: IForm): void {
        const orderedList: IEditorFormlyField[] = [];
        form.fields.forEach(field => {
            this._addField(field, orderedList, 0);
        });

        if (this._formDropListIdMap.get(form.id)) {
            this._formDropListIdMap.get(form.id).next(orderedList.map(f => f.fieldId));
        } else {
            this._formDropListIdMap.set(form.id, new BehaviorSubject(orderedList.map(f => f.fieldId)));
        }
    }

    removeDropListIds(formId: string): void {
        this._formDropListIdMap.get(formId).complete();
        this._formDropListIdMap.delete(formId);
    }

    private _addField(field: IEditorFormlyField, levelList: IEditorFormlyField[], level: number): void {
        if (field.canHaveChildren) {
            const children: IEditorFormlyField[] = getChildren(field);
            children.forEach(child => {
                this._addField(child, levelList, level + 1);
            });

            levelList.push(field);
        }
    }
}
