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
        const formDropListIds = [];
        this._formDropListIdMap.set(formId, formDropListIds);

        const form = this._formService.getForm(formId);
        const visitedSet: Set<string> = new Set();
        form.fields.forEach(field => this._addConnection(field, formDropListIds, visitedSet));
    }

    private _addConnection(field: IBaseEditorFormlyField, connections: string[], visited: Set<string>) {
        visited.add(field.fieldId);

        if (field.canHaveChildren) {
            const children: IBaseEditorFormlyField[] = this._formService.getChildren(field);
            children.forEach(child => {
                if (!visited.has(child.fieldId)) {
                    this._addConnection(child, connections, visited);
                }
            });

            // Only connect to fields with children
            connections.push(field.fieldId);
        }

        if (field.parentFieldId && !visited.has(field.parentFieldId)) {
            const parent: IBaseEditorFormlyField = this._formService.getField(field.formId, field.parentFieldId);
            this._addConnection(parent, connections, visited);
        }
    }
}
