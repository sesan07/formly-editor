import { Inject, Injectable } from '@angular/core';
import { get, isEmpty } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { EditorConfigOption, EditorTypeCategoryOption } from '../../editor.types';
import { EDITOR_FIELD_SERVICE, FieldType, IBaseEditorFormlyField, IFieldService, IForm, WrapperType } from './editor.types';

@Injectable({
    providedIn: 'root',
})
export class EditorService {

    // TODO make this private
    public forms: IForm[] = [];
    public get fieldCategories(): EditorTypeCategoryOption[] { return this._editorConfig.typeCategories; };

    public get formChanged$(): Observable<string> { return this._formChanged$.asObservable(); }
    public get fieldSelected$(): Observable<IBaseEditorFormlyField> { return this._fieldSelected$.asObservable(); }
    public isEditMode = true;

    private _currFormId = 1;
    private _editorConfig: EditorConfigOption;
    private _formChanged$: Subject<string> = new Subject();
    private _fieldSelected$: Subject<IBaseEditorFormlyField> = new Subject();

    constructor(@Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService) {}

    setup(editorConfig: EditorConfigOption) {
        this._editorConfig = editorConfig;
        this.addNewForm('Form Zero');
    }

    public addField(type: string, formId: string, customType?: string, parentFieldId?: string, index?: number): IBaseEditorFormlyField {
        // TODO remove responsibility of setting formId from fieldService?
        const form: IForm = this.getForm(formId);
        const newField: IBaseEditorFormlyField = this._fieldService.getDefaultConfig(type, formId, customType, parentFieldId);
		form.fieldMap.set(newField.fieldId, newField);

		const siblings: IBaseEditorFormlyField[] = this._getSiblings(formId, parentFieldId);
		if (typeof index === 'number') {
			siblings.splice(index, 0, newField);
		} else {
			siblings.push(newField);
		}

		this._formChanged$.next(formId);
		this.selectField(formId, newField.fieldId);

		return newField;
    }

    public removeField(formId: string, fieldId: string, parentId?: string): void {
        const form: IForm = this.getForm(formId);
		const siblings: IBaseEditorFormlyField[] = this._getSiblings(formId, parentId);

        const index: number = siblings.findIndex(field => field.fieldId === fieldId);
        if (index !== -1) {
            siblings.splice(index, 1);
			const childField: IBaseEditorFormlyField = this.getField(formId, fieldId);

            form.fieldMap.delete(fieldId);
            this._formChanged$.next(formId);

			if (parentId) {
				this.selectField(formId, parentId);
			} else if (form.fields[0]?.fieldId) {
				this.selectField(formId, form.fields[0].fieldId);
			}
        }
    }

	public selectField(formId: string, fieldId: string): void {
        const form: IForm = this.getForm(formId);
		const field = form.fieldMap.get(fieldId);
		form.activeField = form.fieldMap.get(fieldId);

		this._fieldSelected$.next(field);
	}

	public replaceParentField(replaceType: string, formId: string, fieldId: string, replaceCustomType?: string): void {
		const field: IBaseEditorFormlyField = this.getField(formId, fieldId);
		const siblings: IBaseEditorFormlyField[] = this._getSiblings(formId, field.parentFieldId);
		const index: number = siblings.findIndex(f => f.fieldId === fieldId);
		const children = this.getChildren(field);

		this.removeField(formId, fieldId, field.parentFieldId);
		const newField: IBaseEditorFormlyField = this.addField(replaceType, formId, replaceCustomType, field.parentFieldId, index);

		// Copy children to new field's children
		children.forEach(child => child.parentFieldId = newField.fieldId);
		const newChildren: IBaseEditorFormlyField[] = this.getChildren(newField);
		newChildren.push(...children);

        // Copy classes
        newField.className = field.className;
        newField.fieldGroupClassName = field.fieldGroupClassName;

        this._formChanged$.next(formId);
	}

	public isActiveField(formId: string, fieldId: string): boolean {
        const form: IForm = this.getForm(formId);
		return form ? form.activeField.fieldId === fieldId : false;
	}

    public getField(formId: string, fieldId: string): IBaseEditorFormlyField {
        const form: IForm = this.getForm(formId);
        return form.fieldMap.get(fieldId);
    }

    public getForm(formId: string): IForm {
        return this.forms.find(f => f.id === formId);
    }

    public addNewForm(name: string): void {
        const formId: string = this._getNextFormId(this._currFormId++);

		this._addForm(formId, name, [], new Map());
		this.addField(this._editorConfig.defaultName, formId, this._editorConfig.defaultCustomName);
    }

    public importForm(name: string, json: string): void {
        let loadedForm: IBaseEditorFormlyField | IBaseEditorFormlyField[];
        try {
            loadedForm = JSON.parse(json);
        } catch(e) {
            console.error('Unable to parse form');
            return;
        }

        const id: string = this._getNextFormId(this._currFormId);
        this._currFormId++;

        const fields: IBaseEditorFormlyField[] = [];
        const fieldMap: Map<string, IBaseEditorFormlyField> = new Map();
        if (Array.isArray(loadedForm)) {
            loadedForm.forEach(field => {
                this._addEditorProperties(field, fieldMap, id);
                fields.push(field);
            });
        } else {
            this._addEditorProperties(loadedForm, fieldMap, id);
            fields.push(loadedForm);
        }

		this._addForm(id, name, fields, fieldMap);
    }

    public removeForm(index: number): void {
        this.forms.splice(index, 1);
    }

	public cleanField(field: IBaseEditorFormlyField, cleanChildren: boolean = true, removeEditorProperties?: boolean): void {
		delete field.fieldProperties;

		if (cleanChildren && field.canHaveChildren) {
            this.getChildren(field).forEach(child => {
                this.cleanField(child, cleanChildren, removeEditorProperties);
            });
		}

		if (removeEditorProperties) {
			this._removeEditorProperties(field);
		}

		this._removeEmptyProperties(field);
	}

    public getFormattedFieldName(name: string, key?: string | number | string[]): string {
		return `${name}${key ? ' (' + key + ')' : ''}`;
    }

	public getChildren(field: IBaseEditorFormlyField): IBaseEditorFormlyField[] {
        if (!field.childrenPath) {
            throw new Error(`'childrenPath' is not configured for ${field.type}`);
        }

        return get(field, field.childrenPath);
	}

    // Move field within a parent field in a form
    public moveField(fieldId: string, formId: string, fromIndex: number, toIndex: number): void {
        const field: IBaseEditorFormlyField = this.getField(formId, fieldId);
        if (!field.parentFieldId) {
            throw new Error('Cannot move field without parent');
        }

        const parent: IBaseEditorFormlyField = this.getField(formId, field.parentFieldId);
        const siblings: IBaseEditorFormlyField[] = this.getChildren(parent);

        moveItemInArray(siblings, fromIndex, toIndex);

        this._formChanged$.next(field.formId);
    }

    // Transfer field between parent fields in the same form
    public transferField(
            fieldId: string,
            formId: string,
            currentParentId: string,
            targetParentId: string,
            currentIndex: number,
            targetIndex: number
        ): void {

        const field: IBaseEditorFormlyField = this.getField(formId, fieldId);
        const currentParent: IBaseEditorFormlyField = this.getField(formId, currentParentId);
        const targetParent: IBaseEditorFormlyField = this.getField(formId, targetParentId);
        const currentSiblings: IBaseEditorFormlyField[] = this.getChildren(currentParent);
        const targetSiblings: IBaseEditorFormlyField[] = this.getChildren(targetParent);

        transferArrayItem(currentSiblings, targetSiblings, currentIndex, targetIndex);

        field.formId = targetParent.formId;
        field.parentFieldId = targetParent.fieldId;
        this._formChanged$.next(formId);
    }

    private _addField(field: IBaseEditorFormlyField, formId: string, parentFieldId?: string, index?: number): void {
        const form: IForm = this.getForm(formId);
		form.fieldMap.set(field.fieldId, field);

		const siblings: IBaseEditorFormlyField[] = this._getSiblings(formId, parentFieldId);
		if (typeof index === 'number') {
			siblings.splice(index, 0, field);
		} else {
			siblings.push(field);
		}

		this._formChanged$.next(formId);
		this.selectField(formId, field.fieldId);
    }

    private _getNextFormName(index: number): string {
        return 'Form ' + index;
    }

    private _getNextFormId(index: number): string {
        return 'form__' + index;
    }

	private _getSiblings(formId: string, parentFieldId?: string): IBaseEditorFormlyField[] {
		if (parentFieldId) {
			const parentField: IBaseEditorFormlyField = this.getField(formId, parentFieldId);
			return this.getChildren(parentField);
		} else {
        	const form: IForm = this.getForm(formId);
			return form.fields;
		}
	}

	private _addForm(id: string, name: string, fields: IBaseEditorFormlyField[], fieldMap: Map<string, IBaseEditorFormlyField>) {
        this.forms.push({
			id,
			name,
			fields,
			fieldMap,
			activeField: fields[0],
			model: {}
		});
	}

    private _addEditorProperties(
        field: IBaseEditorFormlyField,
        fieldMap: Map<string, IBaseEditorFormlyField>,
        formId: string,
        parentFieldId?: string,
    ): void {
        if (!field.type && field.fieldGroup) {
            field.type = FieldType.FORMLY_GROUP;
        }

        const mergedField = Object.assign(this._fieldService.getDefaultConfig(field.type, formId, undefined, parentFieldId), field);
        Object.assign(field, mergedField);

        fieldMap.set(field.fieldId, field);

        if (field.wrappers) {
            const index = field.wrappers.indexOf(WrapperType.EDITOR);
            if (index < 0) {
                field.wrappers.unshift(WrapperType.EDITOR);
            }
        } else {
            field.wrappers = [WrapperType.EDITOR];
        }

        if (field.canHaveChildren) {
            this.getChildren(field).forEach(child => {
                this._addEditorProperties(child, fieldMap, formId, field.fieldId);
            });
        }
    }

	private _removeEmptyProperties(field: IBaseEditorFormlyField): void {
		if (isEmpty(field.wrappers)) {
			delete field.wrappers;
		}
		if (isEmpty(field.templateOptions)) {
			delete field.templateOptions;
		}
		if (isEmpty(field.expressionProperties)) {
			delete field.expressionProperties;
		}
	}

    private _removeEditorProperties(field: IBaseEditorFormlyField): void {
        delete field.name;
        delete field.formId;
        delete field.fieldId;
        delete field.parentFieldId;
        delete field.fieldProperties;
        delete field.canHaveChildren;
        delete field.childrenPath;
        delete field.customType;

        const editorIndex: number = field.wrappers.indexOf(WrapperType.EDITOR);
        if (editorIndex !== -1) {
            field.wrappers.splice(editorIndex, 1);
        }
    }
}
