import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { get, set } from 'lodash-es';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { EditorService } from '../editor.service';
import { EditorTypeOption, IEditorFormlyField, IForm } from '../editor.types';
import { IPropertyChange, PropertyChangeType } from '../property/property.types';
import { getFieldChildren } from './utils';

@Injectable()
export class FormService {
    public fields$: Observable<IEditorFormlyField[]>;
    public activeField$: Observable<IEditorFormlyField>;
    public model$: Observable<Record<string, any>>;
    public isEditMode$: Observable<boolean>;

    private _id: string;
    private _fieldMap: Map<string, IEditorFormlyField> = new Map();

    private _fields$: BehaviorSubject<IEditorFormlyField[]> = new BehaviorSubject([]);
    private _activeField$: BehaviorSubject<IEditorFormlyField> = new BehaviorSubject(null);
    private _model$: BehaviorSubject<Record<string, any>> = new BehaviorSubject({});
    private _isEditMode$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    constructor(private _editorService: EditorService) {
        this.fields$ = this._fields$.asObservable();
        this.activeField$ = this._activeField$.asObservable();
        this.model$ = this._model$.asObservable();
        this.isEditMode$ = this._isEditMode$.asObservable();
    }

    public setup(form: IForm) {
        this._id = form.id;

        form.fields.forEach(field => this._addToFieldMap(field));
        this._fields$.next(form.fields);
        this._activeField$.next(this._fields$.value[0]);
        this._model$.next(form.model);
    }

    public setEditMode(isEditMode: boolean): void {
        this._isEditMode$.next(isEditMode);
    }

    public addField(type: string, customType?: string, parentFieldId?: string, index?: number): IEditorFormlyField {
        const newField: IEditorFormlyField = this._editorService.getDefaultField(
            this._id,
            type,
            customType,
            parentFieldId
        );
        const siblings: IEditorFormlyField[] = this._getSiblings(parentFieldId);
        if (typeof index === 'number') {
            siblings.splice(index, 0, newField);
        } else {
            siblings.push(newField);
        }

        this._addToFieldMap(newField);
        this._fields$.next(this._fields$.value);
        this.selectField(newField._info.fieldId);

        return newField;
    }

    public removeField(fieldId: string, parentId?: string, removeChildren: boolean = true): void {
        const siblings: IEditorFormlyField[] = this._getSiblings(parentId);

        const index: number = siblings.findIndex(f => f._info.fieldId === fieldId);
        if (index !== -1) {
            const field = this.getField(fieldId);
            siblings.splice(index, 1);

            this._removeFromFieldMap(field, removeChildren);
            this._fields$.next(this._fields$.value);

            if (parentId) {
                this.selectField(parentId);
            } else if (this._fields$[0]?.fieldId) {
                this.selectField(this._fields$[0].fieldId);
            }
        }
    }

    public modifyField(change: IPropertyChange) {
        if (!change.path) {
            throw new Error('Path is missing from field change');
        }

        const activeField: IEditorFormlyField = this._activeField$.value;
        if (change.type === PropertyChangeType.VALUE) {
            set(activeField, change.path, change.data);
            this._fields$.next(this._fields$.value);
            this.selectField(activeField._info.fieldId);
        } else if (change.type === PropertyChangeType.KEY) {
            this._modifyKey(activeField, change.path, change.data);
            this._fields$.next(this._fields$.value);
            this.selectField(activeField._info.fieldId);
        }
    }

    public selectField(fieldId: string): void {
        const field = this._fieldMap.get(fieldId);
        this._activeField$.next(field);
    }

    // Move field within a parent field in a form
    public moveField(fieldId: string, fromIndex: number, toIndex?: number): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const fieldInfo = field._info;
        if (!fieldInfo.parentFieldId) {
            throw new Error('Cannot move field without parent');
        }

        const parent: IEditorFormlyField = this.getField(fieldInfo.parentFieldId);
        const siblings: IEditorFormlyField[] = getFieldChildren(parent);

        toIndex = typeof toIndex === 'number' ? toIndex : siblings.length;
        moveItemInArray(siblings, fromIndex, toIndex);

        this._fields$.next(this._fields$.value);
    }

    // Transfer field between parent fields in the same form
    public transferField(fieldId: string, targetParentId: string, fromIndex: number, toIndex?: number): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const fieldInfo = field._info;

        const currentParent: IEditorFormlyField = this.getField(fieldInfo.parentFieldId);
        const targetParent: IEditorFormlyField = this.getField(targetParentId);
        const currentSiblings: IEditorFormlyField[] = getFieldChildren(currentParent);
        const targetSiblings: IEditorFormlyField[] = getFieldChildren(targetParent);

        toIndex = typeof toIndex === 'number' ? toIndex : targetSiblings.length;

        transferArrayItem(currentSiblings, targetSiblings, fromIndex, toIndex);

        fieldInfo.formId = targetParent._info.formId;
        fieldInfo.parentFieldId = targetParent._info.fieldId;
        this._fields$.next(this._fields$.value);
    }

    public replaceParentField(replaceType: string, fieldId: string, replaceCustomType?: string): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const fieldInfo = field._info;

        const siblings: IEditorFormlyField[] = this._getSiblings(fieldInfo.parentFieldId);
        const index: number = siblings.findIndex(f => f._info.fieldId === fieldId);
        const children = getFieldChildren(field);

        this.removeField(fieldId, fieldInfo.parentFieldId, false);
        const newField: IEditorFormlyField = this.addField(
            replaceType,
            replaceCustomType,
            fieldInfo.parentFieldId,
            index
        );

        // Copy children to new field's children
        children.forEach(child => (child._info.parentFieldId = newField._info.fieldId));
        const newChildren: IEditorFormlyField[] = getFieldChildren(newField);
        newChildren.push(...children);

        // Copy properties that shouldn't change
        newField.key = field.key;
        newField.className = field.className;
        newField.fieldGroupClassName = field.fieldGroupClassName;

        this._fields$.next(this._fields$.value);
    }

    public setModel(model: Record<string, any>): void {
        this._model$.next({ ...model });
    }

    public modifyModel(change: IPropertyChange): void {
        if (change.type === PropertyChangeType.VALUE) {
            if (change.path) {
                set(this._model$.value, change.path, change.data);
                this._model$.next({ ...this._model$.value });
            } else {
                this._model$.next({ ...change.data });
            }
        } else if (change.type === PropertyChangeType.KEY) {
            this._modifyKey(this._model$.value, change.path, change.data);
            this._model$.next({ ...this._model$.value });
        }
    }

    public getField(fieldId: string): IEditorFormlyField | undefined {
        return this._fieldMap.get(fieldId);
    }

    public getFields(): IEditorFormlyField[] {
        return this._fields$.value;
    }

    private _getSiblings(parentFieldId?: string): IEditorFormlyField[] {
        if (parentFieldId) {
            const parentField: IEditorFormlyField = this.getField(parentFieldId);
            return getFieldChildren(parentField);
        } else {
            return this._fields$.value;
        }
    }

    private _addToFieldMap(field: IEditorFormlyField): void {
        const fieldInfo = field._info;
        this._fieldMap.set(fieldInfo.fieldId, field);

        // Process children (e.g. 'fieldGroup')
        if (fieldInfo.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._addToFieldMap(child));
        }
    }

    private _removeFromFieldMap(field: IEditorFormlyField, removeChildren: boolean): void {
        const fieldInfo = field._info;
        this._fieldMap.delete(fieldInfo.fieldId);

        // Process children (e.g. 'fieldGroup')
        if (fieldInfo.canHaveChildren && removeChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._removeFromFieldMap(child, removeChildren));
        }
    }

    private _modifyKey(target: any, path: string, newKey: string): void {
        const pathArr: string[] = path.split('.');
        const currKey = pathArr.pop();
        const parentPath: string = pathArr.join('.');
        const parent: any = parentPath ? get(target, parentPath) : target;

        const currentValue: any = get(target, path);
        delete parent[currKey];
        set(parent, newKey, currentValue);
    }
}
