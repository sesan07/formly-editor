import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { getFieldChildren } from './form.utils';
import { FormService } from '../form/form.service';
import { IEditorFormlyField } from '../editor.types';

@Injectable()
export class DroplistService {
    public droplistIds$: Observable<string[]>;

    private _droplistIds$: BehaviorSubject<string[]> = new BehaviorSubject([]);

    constructor(formService: FormService) {
        this.droplistIds$ = this._droplistIds$.asObservable();

        formService.fields$.subscribe(fields => this.updateIds(fields));
    }

    public updateIds(fields: IEditorFormlyField[]): void {
        const ids: string[] = [];
        fields.forEach(field => this._addField(field, ids, 0));

        this._droplistIds$.next(ids);
    }

    private _addField(field: IEditorFormlyField, ids: string[], level: number): void {
        const fieldInfo = field._info;
        if (fieldInfo.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._addField(child, ids, level + 1));

            ids.push(fieldInfo.fieldId);
        }
    }
}
