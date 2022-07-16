import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { EditorService } from '../../services/editor-service/editor.service';
import {
    EditorTypeOption,
    IEditorFormlyField,
    IForm
} from '../../services/editor-service/editor.types';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { getFieldChildren } from '../../utils';

@Injectable()
export class FormService {
    private _id: string;
    private _fields: IEditorFormlyField[];
    private _fieldMap: Map<string, IEditorFormlyField> = new Map();

	private _activeField$: BehaviorSubject<IEditorFormlyField>;
    private _isEditMode$: BehaviorSubject<boolean>;
    private _formChanged$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _fieldDropListService: FieldDroplistService
    ) { }

    public get formChanged$(): Observable<void> { return this._formChanged$.asObservable(); }
    public get activeField$(): Observable<IEditorFormlyField> { return this._activeField$.asObservable(); }
    public get isEditMode$(): Observable<boolean> { return this._isEditMode$.asObservable(); }

    public setup(form: IForm) {
        this._id = form.id;
        this._fields = form.fields;
        this._activeField$ = new BehaviorSubject(this._fields[0]);
        this._isEditMode$ = new BehaviorSubject(true);

        this._fields.forEach(field => this._addToFieldMap(field));
        this._fieldDropListService.updateDropListIds(this._id, this._fields);
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
        this._notifyFormChanged();
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
            this._notifyFormChanged();

			if (parentId) {
				this.selectField(parentId);
			} else if (this._fields[0]?.fieldId) {
				this.selectField(this._fields[0].fieldId);
			}
        }
    }

    public updateField(modifiedField: IEditorFormlyField) {
        const siblings: IEditorFormlyField[] = this._getSiblings(modifiedField.parentFieldId);
        const index: number = siblings.findIndex(f => f.fieldId === modifiedField.fieldId);
        if (index >= 0) {
            siblings[index] = modifiedField;
            this._fieldMap.set(modifiedField.fieldId, modifiedField);
            this._notifyFormChanged();
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

        this._notifyFormChanged();
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
        this._notifyFormChanged();
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

        this._notifyFormChanged();
	}

    public getField(fieldId: string): IEditorFormlyField {
        return this._fieldMap.get(fieldId);
    }

	private _getSiblings(parentFieldId?: string): IEditorFormlyField[] {
		if (parentFieldId) {
			const parentField: IEditorFormlyField = this.getField(parentFieldId);
			return getFieldChildren(parentField);
		} else {
			return this._fields;
		}
	}

    private _addToFieldMap(field: IEditorFormlyField): void {
        this._fieldMap.set(field.fieldId, field);

        // Process children (e.g. 'fieldGroup')
        const typeOption: EditorTypeOption = this._editorService.getTypeOption(field.type, field.customType);
        if (typeOption.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._addToFieldMap(child));
        }
    }

    private _removeFromFieldMap(field: IEditorFormlyField): void {
        this._fieldMap.delete(field.fieldId);

        // Process children (e.g. 'fieldGroup')
        const typeOption: EditorTypeOption = this._editorService.getTypeOption(field.type, field.customType);
        if (typeOption.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._removeFromFieldMap(child));
        }
    }

    private _notifyFormChanged(): void {
        this._fieldDropListService.updateDropListIds(this._id, this._fields);
        this._formChanged$.next();
    }
}
