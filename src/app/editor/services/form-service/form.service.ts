import { Inject, Injectable } from '@angular/core';
// import { IBaseEditorFormlyField, IForm } from './form.types';
// import { FieldType, IBaseEditorFormlyField, IForm, WrapperType } from './form.types';
import { cloneDeep, get, isEmpty } from 'lodash-es';
import { FileService } from '../file-service/file.service';
import { Observable, Subject } from 'rxjs';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { EditorConfig, EditorFieldCategoryConfig, EditorFieldConfig } from '../../editor.types';
import { EDITOR_FIELD_SERVICE, FieldType, IBaseEditorFormlyField, IFieldService, IForm, WrapperType } from './form.types';

@Injectable({
    providedIn: 'root',
})
export class FormService {

    public forms: IForm[] = [];
    public fieldCategories: EditorFieldCategoryConfig[] = [];

    public get formChanged$(): Observable<string> { return this._formChanged$.asObservable(); }
    public get fieldSelected$(): Observable<IBaseEditorFormlyField> { return this._fieldSelected$.asObservable(); }

    private _currFormId = 1;
    private _formChanged$: Subject<string> = new Subject();
    private _fieldSelected$: Subject<IBaseEditorFormlyField> = new Subject();

    constructor(@Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService, private _fileService: FileService) {}

    setup(editorConfig: EditorConfig) {
        this.fieldCategories = editorConfig.fieldCategories;

        const formId: string = this._getNextFormId(this._currFormId);
        const formName: string = this._getNextFormName(this._currFormId);
        this._currFormId++;

		this._addForm(formId, formName, [], new Map());
		this.addField(editorConfig.defaultType, formId, editorConfig.defaultCustomType);
    }

    public addField(type: string, formId: string, customType?: string, parentId?: string, index?: number): IBaseEditorFormlyField {
        const form: IForm = this.forms.find(f => f.id === formId);
		// const fieldService: BaseFieldService<any> = this._getFieldService(type);

        const newField: IBaseEditorFormlyField = this._fieldService.getDefaultConfig(type, formId, customType, parentId);

		// const newField: IBaseEditorFormlyField = fieldService.getDefaultConfig(formId, parentId);
		form.fieldMap.set(newField.fieldId, newField);

		const siblings: IBaseEditorFormlyField[] = this._getSiblings(formId, parentId);
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
        const form: IForm = this.forms.find(f => f.id === formId);
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
        const form: IForm = this.forms.find(f => f.id === formId);
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
	}

	public isActiveField(formId: string, fieldId: string): boolean {
        const form: IForm = this.forms.find(f => f.id === formId);
		return form.activeField.fieldId === fieldId;
	}

    public getField(formId: string, fieldId: string): IBaseEditorFormlyField {
        const form: IForm = this.forms.find(f => f.id === formId);
        return form.fieldMap.get(fieldId);
    }

    public importForm(): void {
        this._fileService.importJSONString()
            .subscribe(json => {
                if (json) {
                    this._loadJSONForm(json);
                }
            });
    }

    public exportForm(index: number): void {
		const form: IForm = this.forms[index];
        const fieldsClone: IBaseEditorFormlyField[] = cloneDeep(form.fields);
        fieldsClone.forEach(field => this.cleanField(field, true, true));
        // TODO add ability to export single line instead of 4-space formatted JSON, see if it still works... it should...
        this._fileService.exportJSONString(JSON.stringify(fieldsClone, null, 4), 'form.json');
    }

    public removeForm(index: number): void {
        this.forms.splice(index, 1);
    }

	public cleanField(field: IBaseEditorFormlyField, cleanChildren: boolean = true, removeEditorProperties?: boolean): void {
		// Editor properties
		if (removeEditorProperties) {
			this._removeEditorProperties(field);
		}

        // General properties
		delete field.fieldProperties;
		this._removeEmptyProperties(field);

		// Children
		if (!cleanChildren) {
			return;
		}
        if (field.fieldGroup) {
            field.fieldGroup.forEach(fieldGroupChild => {
                this.cleanField(fieldGroupChild, cleanChildren, removeEditorProperties);
            });
        }
	}

    public getFieldTypeName(type: string, customType?: string): string {
        // TODO implement this properly
        return this.fieldCategories[0].fields.find(field => field.type === type).name;

        // const fieldService: BaseFieldService<any> = this._getFieldService(type);
        // return fieldService.name;
    }

    public getFormattedFieldName(name: string, key?: string | number | string[]): string {
		return `${name}${key ? ' (' + key + ')' : ''}`;
    }

	public getParentFieldTypes(): string[] {
        // TODO implement this properly
        return this.fieldCategories[0]?.fields?.filter(field => field.canHaveChildren)?.map(f => f.type) ?? [];
		// return [FieldType.FORMLY_GROUP];
	}

	public getChildren(field: IBaseEditorFormlyField): IBaseEditorFormlyField[] {
        // TOD implement properly
        if (field.canHaveChildren) {
            if (!field.childrenPath) {
                throw new Error(`childrenPath is not configured for ${field.type}`);
            }

            return get(field, field.childrenPath);

        } else {
            throw new Error(`Attempting to get children for field '${field.type}', but it's not configured to have children`);
        }
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
        	const form: IForm = this.forms.find(f => f.id === formId);
			return form.fields;
		}
	}

    private _loadJSONForm(json: string): void {
        const loadedForm: IBaseEditorFormlyField | IBaseEditorFormlyField[] = JSON.parse(json);

        const id: string = this._getNextFormId(this._currFormId);
        const name: string = this._getNextFormName(this._currFormId);
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
        parentId?: string,
    ): void {
        if (!field.type && field.fieldGroup) {
            field.type = FieldType.FORMLY_GROUP;
        }

        // const fieldService: BaseFieldService<any> = this._getFieldService(field.type);

        // const supportedFieldType: FieldType = Object.values(FieldType).includes(field.type)
        //     ? field.type
        //     : FieldType.OTHER;

        // TOD implement properly
        field.name = this.fieldCategories[0].fields.find(f => f.type === field.type).name;

        field.formId = formId;
        field.parentFieldId = parentId;
        field.fieldId = this._fieldService.getNextFieldId(field.type);
        fieldMap.set(field.fieldId, field);

		// TODO verify if keys are always requierd when not formly-group
        // if (!field.key && supportedFieldType !== FieldType.FORMLY_GROUP) {
        //     field.key = fieldService.getNextKey();
        // }

        if (field.wrappers) {
            field.wrappers.unshift(WrapperType.EDITOR);
        } else {
            field.wrappers = [WrapperType.EDITOR];
        }

        if (!field.templateOptions) {
            field.templateOptions = {};
        }

        if (!field.expressionProperties) {
            field.expressionProperties = {};
        }

        field.fieldProperties = this._fieldService.getProperties(field.type);

        if (field.fieldGroup) {
            field.fieldGroup.forEach(fieldGroupChild => {
                this._addEditorProperties(fieldGroupChild, fieldMap, formId, field.fieldId);
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

        const editorIndex: number = field.wrappers.indexOf(WrapperType.EDITOR);
        if (editorIndex !== -1) {
            field.wrappers.splice(editorIndex, 1);
        }
    }
}
