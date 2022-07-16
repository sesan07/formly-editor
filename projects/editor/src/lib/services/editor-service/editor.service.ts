import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { get, isEmpty, merge, set } from 'lodash-es';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
    EDITOR_FIELD_SERVICE,
    FieldType,
    IEditorFormlyField,
    IFieldService,
    IForm,
    IBaseFormlyField,
    EditorConfigOption,
    EditorTypeCategoryOption,
    EditorTypeOption,
} from './editor.types';
import { IProperty } from '../../components/property/property.types';
import { FieldDroplistService } from '../field-droplist-service/field-droplist.service';
import { getFieldChildren } from '../../utils';

@Injectable()
export class EditorService {
    private _currFormId = 0;
    private _editorConfig: EditorConfigOption;
    private _formChanged$: Subject<string> = new Subject();
    private _forms$: BehaviorSubject<IForm[]> = new BehaviorSubject([]);

    private _fieldIdCounterMap: Map<string, number> = new Map(); // Map<fieldType, count>
    private _fieldtypeOptions: EditorTypeOption[] = [];

    constructor(
        @Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService,
        private _http: HttpClient,
        private _fieldDropListService: FieldDroplistService
    ) {}

    public get forms$(): Observable<IForm[]> { return this._forms$.asObservable(); }
    public get formChanged$(): Observable<string> { return this._formChanged$.asObservable(); }
    public get fieldCategories(): EditorTypeCategoryOption[] { return this._editorConfig.typeCategories; };

    setup(editorConfig: EditorConfigOption) {
        this._editorConfig = editorConfig;
        this._editorConfig.typeCategories.forEach(category => this._fieldtypeOptions.push(...category.typeOptions));
        this._loadDefaultForm();
    }

    public addField(type: string, formId: string, customType?: string, parentFieldId?: string, index?: number): IEditorFormlyField {
        const form: IForm = this.getForm(formId);
        const newField: IEditorFormlyField = this.getDefaultConfig(formId, type, customType, parentFieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, parentFieldId);
		if (typeof index === 'number') {
			siblings.splice(index, 0, newField);
		} else {
			siblings.push(newField);
		}
        this._addToFieldMap(newField, form.fieldMap);

        this._notifyFormChanged(formId);
		this.selectField(formId, newField.fieldId);

		return newField;
    }

    public removeField(formId: string, fieldId: string, parentId?: string): void {
        const form: IForm = this.getForm(formId);
        console.log('Before: ', Array.from(form.fieldMap.keys()).toString());
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, parentId);

        const index: number = siblings.findIndex(f => f.fieldId === fieldId);
        if (index !== -1) {
            const field = this.getField(formId, fieldId);
            siblings.splice(index, 1);

            this._removeFromFieldMap(field, form.fieldMap);
            this._notifyFormChanged(formId);

			if (parentId) {
				this.selectField(formId, parentId);
			} else if (form.fields[0]?.fieldId) {
				this.selectField(formId, form.fields[0].fieldId);
			}
        }
    }

    public updateField(modifiedField: IEditorFormlyField) {
        const siblings: IEditorFormlyField[] = this._getSiblings(modifiedField.formId, modifiedField.parentFieldId);
        const index: number = siblings.findIndex(f => f.fieldId === modifiedField.fieldId);
        if (index >= 0) {
            siblings[index] = modifiedField;
            const form: IForm = this.getForm(modifiedField.formId);
            form.fieldMap.set(modifiedField.fieldId, modifiedField);
            this._notifyFormChanged(form.id);
            this.selectField(form.id, modifiedField.fieldId);
        }
    }

	public selectField(formId: string, fieldId: string): void {
        const form: IForm = this.getForm(formId);
		const field = form.fieldMap.get(fieldId);
		form.activeField$.next(field);
	}

    // Move field within a parent field in a form
    public moveField(fieldId: string, formId: string, fromIndex: number, toIndex?: number): void {
        const field: IEditorFormlyField = this.getField(formId, fieldId);
        if (!field.parentFieldId) {
            throw new Error('Cannot move field without parent');
        }

        const parent: IEditorFormlyField = this.getField(formId, field.parentFieldId);
        const siblings: IEditorFormlyField[] = getFieldChildren(parent);

        toIndex = typeof toIndex === 'number' ? toIndex : siblings.length;
        moveItemInArray(siblings, fromIndex, toIndex);

        this._notifyFormChanged(field.formId);
    }

    // Transfer field between parent fields in the same form
    public transferField(
            fieldId: string,
            formId: string,
            targetParentId: string,
            fromIndex: number,
            toIndex?: number,
        ): void {

        const field: IEditorFormlyField = this.getField(formId, fieldId);
        const currentParent: IEditorFormlyField = this.getField(formId, field.parentFieldId);
        const targetParent: IEditorFormlyField = this.getField(formId, targetParentId);
        const currentSiblings: IEditorFormlyField[] = getFieldChildren(currentParent);
        const targetSiblings: IEditorFormlyField[] = getFieldChildren(targetParent);

        toIndex = typeof toIndex === 'number' ? toIndex : targetSiblings.length;

        transferArrayItem(currentSiblings, targetSiblings, fromIndex, toIndex);

        field.formId = targetParent.formId;
        field.parentFieldId = targetParent.fieldId;
        this._notifyFormChanged(formId);
    }

	public replaceParentField(replaceType: string, formId: string, fieldId: string, replaceCustomType?: string): void {
		const field: IEditorFormlyField = this.getField(formId, fieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, field.parentFieldId);
		const index: number = siblings.findIndex(f => f.fieldId === fieldId);
		const children = getFieldChildren(field);

		this.removeField(formId, fieldId, field.parentFieldId);
		const newField: IEditorFormlyField = this.addField(replaceType, formId, replaceCustomType, field.parentFieldId, index);

		// Copy children to new field's children
		children.forEach(child => child.parentFieldId = newField.fieldId);
		const newChildren: IEditorFormlyField[] = getFieldChildren(newField);
		newChildren.push(...children);

        // Copy properties that shouldn't change
        newField.key = field.key;
        newField.className = field.className;
        newField.fieldGroupClassName = field.fieldGroupClassName;

        this._notifyFormChanged(formId);
	}

    public getDefaultConfig(formId: string, type: string, customType?: string, parentFieldId?: string): IEditorFormlyField {
        const form: IForm = this.getForm(formId);
        const defaultField: IBaseFormlyField = this._fieldService.getDefaultConfig(type, customType);
        const field: IEditorFormlyField = this._convertToEditorField(defaultField, formId, parentFieldId);
        return field;
    }

    public getField(formId: string, fieldId: string): IEditorFormlyField {
        const form: IForm = this.getForm(formId);
        return form.fieldMap.get(fieldId);
    }

    public getForm(formId: string): IForm {
        return this._forms$.value.find(f => f.id === formId);
    }

    public addForm(name: string): void {
        const formId: string = this._getNextFormId(this._currFormId++);

		this._addForm(formId, name, [], new Map());
		this.addField(this._editorConfig.defaultName, formId, this._editorConfig.defaultCustomName);
    }

    public importForm(name: string, source: string | IBaseFormlyField | IBaseFormlyField[], model?: Record<string, unknown>): void {
        let loadedForm: IBaseFormlyField | IBaseFormlyField[];
        if (typeof source === 'string') {
            try {
                loadedForm = JSON.parse(source);
            } catch(e) {
                console.error('Unable to parse form');
                return;
            }
        } else {
            loadedForm = source;
        }

        const formId: string = this._getNextFormId(this._currFormId);
        this._currFormId++;

        const fields: IEditorFormlyField[] = [];
        const fieldMap: Map<string, IEditorFormlyField> = new Map();
        if (Array.isArray(loadedForm)) {
            loadedForm.forEach(field => {
                const editorField: IEditorFormlyField = this._convertToEditorField(field, formId);
                this._addToFieldMap(editorField, fieldMap);
                fields.push(editorField);
            });
        } else {
            const editorField: IEditorFormlyField = this._convertToEditorField(loadedForm, formId);
            this._addToFieldMap(editorField, fieldMap);
            fields.push(editorField);
        }

		this._addForm(formId, name, fields, fieldMap, model);
    }

    public removeForm(index: number): void {
        const forms: IForm[] = this._forms$.value;
        this._fieldDropListService.removeDropListIds(forms[index].id);
        forms.splice(index, 1);
        this._forms$.next(forms.slice());
    }

	public cleanField(field: IEditorFormlyField, cleanChildren: boolean = true, removeEditorProperties?: boolean): void {
		delete field.properties;

		if (cleanChildren && field.canHaveChildren) {
            getFieldChildren(field).forEach(child => {
                this.cleanField(child, cleanChildren, removeEditorProperties);
            });
		}

		if (removeEditorProperties) {
			this._removeEditorProperties(field);
            this._removeEmptyProperties(field);
		}
	}

    private _addToFieldMap(field: IEditorFormlyField, fieldMap: Map<string, IEditorFormlyField>): void {
        fieldMap.set(field.fieldId, field);

        // Process children (e.g. 'fieldGroup')
        const typeOption: EditorTypeOption = this._getTypeOption(field.type, field.customType);// Process children (e.g. 'fieldGroup')
        if (typeOption.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._addToFieldMap(child, fieldMap));
        }
    }

    private _removeFromFieldMap(field: IEditorFormlyField, fieldMap: Map<string, IEditorFormlyField>): void {
        fieldMap.delete(field.fieldId);

        // Process children (e.g. 'fieldGroup')
        const typeOption: EditorTypeOption = this._getTypeOption(field.type, field.customType);
        if (typeOption.canHaveChildren) {
            const children: IEditorFormlyField[] = getFieldChildren(field);
            children.forEach(child => this._removeFromFieldMap(child, fieldMap));
        }
    }

    private _convertToEditorField(
        sourceField: IBaseFormlyField,
        formId: string,
        parentFieldId?: string
    ): IEditorFormlyField {
        // Special case to specify 'formly-group' type
        if (!sourceField.type && sourceField.fieldGroup) {
            sourceField.type = FieldType.FORMLY_GROUP;
        }

        // Merge with default properties
        const baseField: IBaseFormlyField = this._fieldService.getDefaultConfig(sourceField.type, sourceField.customType);
        merge(baseField, sourceField);

        // Properties
        const properties: IProperty[] = this._fieldService.getProperties(baseField.type);

        // Create editor field
        const typeOption: EditorTypeOption = this._getTypeOption(baseField.type, baseField.customType);
        const field: IEditorFormlyField = {
            ...baseField,
            name: typeOption.displayName,
            fieldGroup: undefined,
            formId,
            fieldId: this._getNextFieldId(baseField.type),
            parentFieldId,
            canHaveChildren: typeOption.canHaveChildren,
            childrenPath: typeOption.childrenPath,
            properties,
        };

        // Process children (e.g. 'fieldGroup')
        if (typeOption.canHaveChildren) {
            const baseChildren: IBaseFormlyField[] = get(baseField, typeOption.childrenPath);
            const children: IEditorFormlyField[] = baseChildren?.map(child =>
                this._convertToEditorField(child, formId, field.fieldId)
            );
            set(field, typeOption.childrenPath, children);
        }

        return field;
    }

    private _loadDefaultForm(): void {
        forkJoin([
            this._http.get<IBaseFormlyField>('assets/default.form.json').pipe(
                catchError(() => {
                    console.warn('Unable to load default form, using default field');
                    const defaultField: IBaseFormlyField = this._fieldService.getDefaultConfig(
                        this._editorConfig.defaultName,
                        this._editorConfig.defaultCustomName
                    );
                    return of(defaultField);
                })
            ),
            this._http.get<Record<string, unknown>>('assets/default.model.json').pipe(
                catchError(() => {
                    console.warn('Unable to load default model, using {}');
                    return of({});
                })
            )
        ])
        .subscribe(([form, model]) => {
            this.importForm('Form Zero', form, model);
        });
    }

    private _getNextFormId(index: number): string {
        return 'form__' + index;
    }

    private _getNextFieldId(type: string): string {
        type = type ?? this._editorConfig.unknownTypeName ?? 'unknown';
        let id: number;
        if (this._fieldIdCounterMap.has(type)) {
            id = this._fieldIdCounterMap.get(type) + 1;
        } else {
            id = 0;
        }
        this._fieldIdCounterMap.set(type, id);
        return type + '__' + id;
    }

	private _getSiblings(formId: string, parentFieldId?: string): IEditorFormlyField[] {
		if (parentFieldId) {
			const parentField: IEditorFormlyField = this.getField(formId, parentFieldId);
			return getFieldChildren(parentField);
		} else {
        	const form: IForm = this.getForm(formId);
			return form.fields;
		}
	}

	private _addForm(
        id: string,
        name: string,
        fields: IEditorFormlyField[],
        fieldMap: Map<string, IEditorFormlyField>,
        model?: Record<string, unknown>
    ) {
        this._forms$.next([
            ...this._forms$.value,
            {
                id,
                name,
                fields,
                fieldMap,
                model: model ?? {},
                activeField$: new BehaviorSubject(fields[0]),
                isEditMode$: new BehaviorSubject(true),
            }
        ]);

        this._notifyFormChanged(id);
	}

	private _removeEmptyProperties(field: IEditorFormlyField): void {
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

    private _getTypeOption(type: string, customType?: string): EditorTypeOption {
        let typeOption: EditorTypeOption = this._fieldtypeOptions.find(
            option => option.name === type && option.customName === customType
        );

        if (!typeOption && this._editorConfig.unknownTypeName) {
            typeOption = this._fieldtypeOptions.find(
                option => option.name === this._editorConfig.unknownTypeName
            );
        }

        if(!typeOption) {
            console.warn('EditorTypeOption not configured for type: ' + type);
            typeOption = { name: undefined, displayName: 'Unknown Type' };
        }

        return typeOption;
    }

    private _removeEditorProperties(field: IEditorFormlyField): void {
        delete field.name;
        delete field.formId;
        delete field.fieldId;
        delete field.parentFieldId;
        delete field.properties;
        delete field.canHaveChildren;
        delete field.childrenPath;
        delete field.customType;
    }

    private _notifyFormChanged(formId: string): void {
        const form: IForm = this.getForm(formId);
        this._fieldDropListService.updateDropListIds(form);
        this._formChanged$.next(formId);
    }
}
