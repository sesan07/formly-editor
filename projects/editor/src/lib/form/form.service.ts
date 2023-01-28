import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { cloneDeep, get, isEmpty, set, unset } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

import { EditorService } from '../editor.service';
import { IEditorFormlyField, IForm } from '../editor.types';
import { IPropertyChange, PropertyChangeType } from '../property/property.types';
import { getFieldChildren } from './form.utils';
import { overrideFields } from './override.utils';

@Injectable()
export class FormService {
    public fields$: Observable<IEditorFormlyField[]>;
    public activeField$: Observable<IEditorFormlyField>;
    public model$: Observable<Record<string, any>>;
    public isEditMode$: Observable<boolean>;
    public isOverrideMode$: Observable<boolean>;

    private _fieldMap: Map<string, IEditorFormlyField> = new Map();

    private _fields$: BehaviorSubject<IEditorFormlyField[]> = new BehaviorSubject([]);
    private _activeField$: BehaviorSubject<IEditorFormlyField | null> = new BehaviorSubject(null);
    private _model$: BehaviorSubject<Record<string, any>> = new BehaviorSubject({});
    private _isEditMode$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _isOverrideMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private _form: IForm;
    private _baseFields: IEditorFormlyField[];
    private _overridenFields: IEditorFormlyField[];

    constructor(private _editorService: EditorService) {
        this.fields$ = this._fields$.asObservable();
        this.activeField$ = this._activeField$.asObservable();
        this.model$ = this._model$.asObservable();
        this.isEditMode$ = this._isEditMode$.asObservable();
        this.isOverrideMode$ = this._isOverrideMode$.asObservable();
    }

    public get isOverrideMode(): boolean {
        return this._isOverrideMode$.value;
    }

    public setup(form: IForm) {
        this._form = form;
        this._baseFields = this._form.fields;
        this._resetFields();
        this._activeField$.next(this._fields$.value[0]);
        this._model$.next(form.model);

        this.isOverrideMode$.subscribe(() => {
            this._resetFields();
        });
    }

    public setEditMode(isEditMode: boolean): void {
        this._isEditMode$.next(isEditMode);
    }

    public setOverrideMode(isOverrideMode: boolean): void {
        this._isOverrideMode$.next(isOverrideMode);
    }

    public addField(type: string, customType?: string, parentFieldId?: string, index?: number): IEditorFormlyField {
        const newField: IEditorFormlyField = this._editorService.getDefaultField(
            this._form.id,
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

            this.selectField(parentId);
        }
    }

    public modifyField(change: IPropertyChange) {
        const activeField: IEditorFormlyField = this._activeField$.value;

        if (!change.path) {
            throw new Error('Path is missing from field change');
        }

        if (this.isOverrideMode && !activeField.key) {
            throw new Error(`Field without key can't be overridden`);
        }

        // TODO disable field to prevent this
        if (this.isOverrideMode && change.path === 'key') {
            throw new Error(`Field key can't be overridden`);
        }

        if (change.type === PropertyChangeType.VALUE) {
            set(activeField, change.path, change.data);
        } else if (change.type === PropertyChangeType.KEY) {
            this._modifyKey(activeField, change.path, change.data);
        }

        if (this.isOverrideMode) {
            this._modifyOverriddenField(change);
        }

        this._fields$.next(this._fields$.value);
        this.selectField(activeField._info.fieldId);
    }

    public selectField(fieldId: string | null): void {
        const field = this._fieldMap.get(fieldId) ?? null;
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

    private _resetFields(): void {
        this._fieldMap.clear();

        if (this.isOverrideMode) {
            this._overridenFields = overrideFields(cloneDeep(this._baseFields), this._form.override);
            this._overridenFields.forEach(field => this._addToFieldMap(field));
            this._fields$.next(this._overridenFields);
        } else {
            this._baseFields.forEach(field => this._addToFieldMap(field));
            this._fields$.next(this._baseFields);
        }

        this.selectField(this._activeField$.value?._info.fieldId);
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

    private _modifyOverriddenField(change: IPropertyChange): void {
        const activeField: IEditorFormlyField = this._activeField$.value;
        const keyPath: string = this._getKeyPath(activeField);
        const override: Record<string, any> = this._form.override.override;

        if (change.type === PropertyChangeType.VALUE) {
            const fieldOverride = override[keyPath] ?? {};

            const pathArr = change.path.split('.');
            const arrItemKeyIndex = pathArr.findIndex(k => !isNaN(Number(k)));
            if (arrItemKeyIndex >= 1) {
                const arrPath = pathArr.slice(0, arrItemKeyIndex);
                set(fieldOverride, arrPath, get(activeField, arrPath));
            } else {
                set(fieldOverride, change.path, change.data);
            }
            override[keyPath] = fieldOverride;

            activeField._info.fieldOverride = fieldOverride;
        } else if (change.type === PropertyChangeType.CLEAR_OVERRIDE) {
            const fieldOverride = override[keyPath];
            unset(fieldOverride, change.path);

            // Remove empty field property override
            const pathArr = change.path.split('.');
            for (let i = pathArr.length - 1; i >= 1; i--) {
                const currPath = pathArr.slice(0, i);
                if (isEmpty(get(fieldOverride, currPath))) {
                    unset(fieldOverride, currPath);
                }
            }

            // Remove empty field override
            if (isEmpty(fieldOverride)) {
                unset(override, keyPath);
            }

            this._resetFields();
        }
    }

    private _getKeyPath(field: IEditorFormlyField, path: string = ''): string {
        // Process children (e.g. 'fieldGroup')
        const fieldInfo = field._info;
        if (fieldInfo.parentFieldId) {
            const parent: IEditorFormlyField = this.getField(fieldInfo.parentFieldId);
            path += this._getKeyPath(parent, path);
        }

        const key: string = field.key?.toString();
        if (key) {
            path = path ? `${path}.${key}` : key;
        }

        return path;
    }
}
