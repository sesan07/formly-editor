import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { getFieldChildren } from '../../utils';
import { FormService } from '../../components/form/form.service';
import { IEditorFormlyField } from '../../services/editor-service/editor.types';

@Injectable()
export class DroplistService {
    private _droplistIds$: BehaviorSubject<string[]> = new BehaviorSubject([]);

    constructor(formService: FormService) {
        formService.fields$.subscribe(fields => this.updateIds(fields));
    }

    public get droplistIds$(): Observable<string[]> {
        return this._droplistIds$.asObservable();
    }

    public updateIds(fields: IEditorFormlyField[]): void {
        const ids: string[] = [];
        fields.forEach(field => this._addField(field, ids, 0));

        this._droplistIds$.next(ids);
    }

    private _addField(field: IEditorFormlyField, ids: string[], level: number): void {
        if (field.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._addField(child, ids, level + 1));

            ids.push(field.fieldId);
        }
    }
}
