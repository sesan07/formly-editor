import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { EditorService } from '../editor.service';
import {
    EditorTypeOption,
    IEditorFormlyField,
    IForm
} from '../editor.types';
import { getFieldChildren } from './utils';

@Injectable()
export class FormService {
    private _id: string;
    private _fieldMap: Map<string, IEditorFormlyField> = new Map();

    private _fields$: BehaviorSubject<IEditorFormlyField[]> = new BehaviorSubject([]);
	private _activeField$: BehaviorSubject<IEditorFormlyField> = new BehaviorSubject(null);
    private _isEditMode$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    constructor(private _editorService: EditorService) { }

    public get fields$(): Observable<IEditorFormlyField[]> { return this._fields$.asObservable(); }
    public get activeField$(): Observable<IEditorFormlyField> { return this._activeField$.asObservable(); }
    public get isEditMode$(): Observable<boolean> { return this._isEditMode$.asObservable(); }

    public setup(form: IForm) {
        this._id = form.id;

        form.fields.forEach(field => this._addToFieldMap(field));
        this._fields$.next(form.fields);
        this._activeField$.next(this._fields$.value[0]);
    }

    public setEditMode(isEditMode: boolean): void {
        this._isEditMode$.next(isEditMode);
    }

    public addField(type: string, customType?: string, parentFieldId?: string, index?: number): IEditorFormlyField {
        const newField: IEditorFormlyField = this._editorService.getDefaultField(this._id, type, customType, parentFieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(parentFieldId);
		if (typeof index === 'number') {
			siblings.splice(index, 0, newField);
		} else {
			siblings.push(newField);
		}

        this._addToFieldMap(newField);
        this._fields$.next(this._fields$.value);
		this.selectField(newField.fieldId);

		return newField;
    }

    public removeField(fieldId: string, parentId?: string): void {
		const siblings: IEditorFormlyField[] = this._getSiblings(parentId);

        const index: number = siblings.findIndex(f => f.fieldId === fieldId);
        if (index !== -1) {
            const field = this.getField(fieldId);
            siblings.splice(index, 1);

            this._removeFromFieldMap(field);
            this._fields$.next(this._fields$.value);

			if (parentId) {
				this.selectField(parentId);
			} else if (this._fields$[0]?.fieldId) {
				this.selectField(this._fields$[0].fieldId);
			}
        }
    }

    public updateField(modifiedField: IEditorFormlyField) {
        const siblings: IEditorFormlyField[] = this._getSiblings(modifiedField.parentFieldId);
        const index: number = siblings.findIndex(f => f.fieldId === modifiedField.fieldId);
        if (index >= 0) {
            siblings[index] = modifiedField;
            this._fieldMap.set(modifiedField.fieldId, modifiedField);
            this._fields$.next(this._fields$.value);
            this.selectField(modifiedField.fieldId);
        }
    }

	public selectField(fieldId: string): void {
		const field = this._fieldMap.get(fieldId);
		this._activeField$.next(field);
	}

    // Move field within a parent field in a form
    public moveField(fieldId: string, fromIndex: number, toIndex?: number): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        if (!field.parentFieldId) {
            throw new Error('Cannot move field without parent');
        }

        const parent: IEditorFormlyField = this.getField(field.parentFieldId);
        const siblings: IEditorFormlyField[] = getFieldChildren(parent);

        toIndex = typeof toIndex === 'number' ? toIndex : siblings.length;
        moveItemInArray(siblings, fromIndex, toIndex);

        this._fields$.next(this._fields$.value);
    }

    // Transfer field between parent fields in the same form
    public transferField(
        fieldId: string,
        targetParentId: string,
        fromIndex: number,
        toIndex?: number,
    ): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const currentParent: IEditorFormlyField = this.getField(field.parentFieldId);
        const targetParent: IEditorFormlyField = this.getField(targetParentId);
        const currentSiblings: IEditorFormlyField[] = getFieldChildren(currentParent);
        const targetSiblings: IEditorFormlyField[] = getFieldChildren(targetParent);

        toIndex = typeof toIndex === 'number' ? toIndex : targetSiblings.length;

        transferArrayItem(currentSiblings, targetSiblings, fromIndex, toIndex);

        field.formId = targetParent.formId;
        field.parentFieldId = targetParent.fieldId;
        this._fields$.next(this._fields$.value);
    }

	public replaceParentField(replaceType: string, fieldId: string, replaceCustomType?: string): void {
		const field: IEditorFormlyField = this.getField(fieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(field.parentFieldId);
		const index: number = siblings.findIndex(f => f.fieldId === fieldId);
		const children = getFieldChildren(field);

		this.removeField(fieldId, field.parentFieldId);
		const newField: IEditorFormlyField = this.addField(replaceType, replaceCustomType, field.parentFieldId, index);

		// Copy children to new field's children
		children.forEach(child => child.parentFieldId = newField.fieldId);
		const newChildren: IEditorFormlyField[] = getFieldChildren(newField);
		newChildren.push(...children);


        // Copy properties that shouldn't change
        newField.key = field.key;
        newField.className = field.className;
        newField.fieldGroupClassName = field.fieldGroupClassName;

        this._fields$.next(this._fields$.value);
	}

    public getField(fieldId: string): IEditorFormlyField | undefined {
        return this._fieldMap.get(fieldId);
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
        this._fieldMap.set(field.fieldId, field);

        // Process children (e.g. 'fieldGroup')
        if (field.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._addToFieldMap(child));
        }
    }

    private _removeFromFieldMap(field: IEditorFormlyField): void {
        this._fieldMap.delete(field.fieldId);

        // Process children (e.g. 'fieldGroup')
        if (field.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._removeFromFieldMap(child));
        }
    }
}
