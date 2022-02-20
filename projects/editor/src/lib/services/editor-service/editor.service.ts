import { Inject, Injectable } from '@angular/core';
import { get, isEmpty, set } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { EditorConfigOption, EditorTypeCategoryOption, EditorTypeOption } from '../../editor.types';
import {
    EDITOR_FIELD_SERVICE,
    FieldType,
    IEditorFormlyField,
    IFieldService,
    IForm,
    WrapperType,
    IBaseFormlyField,
} from './editor.types';
import { IProperty, PropertyType } from '../../components/property/property.types';
import { IChipListProperty } from '../../components/property/chip-list-property/chip-list-property.types';

@Injectable({
    providedIn: 'root',
})
export class EditorService {

    // TODO make this private
    public forms: IForm[] = [];
    public get fieldCategories(): EditorTypeCategoryOption[] { return this._editorConfig.typeCategories; };

    public get formChanged$(): Observable<string> { return this._formChanged$.asObservable(); }
    public get fieldSelected$(): Observable<IEditorFormlyField> { return this._fieldSelected$.asObservable(); }
    public isEditMode = true;

    private _currFormId = 0;
    private _editorConfig: EditorConfigOption;
    private _formChanged$: Subject<string> = new Subject();
    private _fieldSelected$: Subject<IEditorFormlyField> = new Subject();

    private _fieldIdCounterMap: Map<string, number> = new Map(); // Map<fieldType, count>
    private _fieldtypeOptions: EditorTypeOption[] = [];

    constructor(@Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService) {}

    setup(editorConfig: EditorConfigOption) {
        this._editorConfig = editorConfig;
        this._editorConfig.typeCategories.forEach(category => this._fieldtypeOptions.push(...category.typeOptions));
        this.addNewForm('Form Zero');
    }

    public addField(type: string, formId: string, customType?: string, parentFieldId?: string, index?: number): IEditorFormlyField {
        const newField: IEditorFormlyField = this.getDefaultConfig(formId, type, customType, parentFieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, parentFieldId);
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
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, parentId);

        const index: number = siblings.findIndex(field => field.fieldId === fieldId);
        if (index !== -1) {
            siblings.splice(index, 1);

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
		const field: IEditorFormlyField = this.getField(formId, fieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, field.parentFieldId);
		const index: number = siblings.findIndex(f => f.fieldId === fieldId);
		const children = this.getChildren(field);

		this.removeField(formId, fieldId, field.parentFieldId);
		const newField: IEditorFormlyField = this.addField(replaceType, formId, replaceCustomType, field.parentFieldId, index);

		// Copy children to new field's children
		children.forEach(child => child.parentFieldId = newField.fieldId);
		const newChildren: IEditorFormlyField[] = this.getChildren(newField);
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

    public getDefaultConfig(formId: string, type: string, customType?: string, parentFieldId?: string): IEditorFormlyField {
        const form: IForm = this.getForm(formId);
        const defaultField: IBaseFormlyField = this._fieldService.getDefaultConfig(type, customType);
        return this._convertToEditorField(defaultField, formId, form.fieldMap, parentFieldId);
    }

    public getField(formId: string, fieldId: string): IEditorFormlyField {
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
        let loadedForm: IBaseFormlyField | IBaseFormlyField[];
        try {
            loadedForm = JSON.parse(json);
        } catch(e) {
            console.error('Unable to parse form');
            return;
        }

        const formId: string = this._getNextFormId(this._currFormId);
        this._currFormId++;

        const fields: IEditorFormlyField[] = [];
        const fieldMap: Map<string, IEditorFormlyField> = new Map();
        if (Array.isArray(loadedForm)) {
            loadedForm.forEach(field => {
                fields.push(this._convertToEditorField(field, formId, fieldMap));
            });
        } else {
            fields.push(this._convertToEditorField(loadedForm, formId, fieldMap));
        }

		this._addForm(formId, name, fields, fieldMap);
    }

    public removeForm(index: number): void {
        this.forms.splice(index, 1);
    }

	public cleanField(field: IEditorFormlyField, cleanChildren: boolean = true, removeEditorProperties?: boolean): void {
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

	public getChildren(field: IEditorFormlyField): IEditorFormlyField[] | undefined {
        return get(field, field.childrenPath);
	}

    // Move field within a parent field in a form
    public moveField(fieldId: string, formId: string, fromIndex: number, toIndex: number): void {
        const field: IEditorFormlyField = this.getField(formId, fieldId);
        if (!field.parentFieldId) {
            throw new Error('Cannot move field without parent');
        }

        const parent: IEditorFormlyField = this.getField(formId, field.parentFieldId);
        const siblings: IEditorFormlyField[] = this.getChildren(parent);

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

        const field: IEditorFormlyField = this.getField(formId, fieldId);
        const currentParent: IEditorFormlyField = this.getField(formId, currentParentId);
        const targetParent: IEditorFormlyField = this.getField(formId, targetParentId);
        const currentSiblings: IEditorFormlyField[] = this.getChildren(currentParent);
        const targetSiblings: IEditorFormlyField[] = this.getChildren(targetParent);

        transferArrayItem(currentSiblings, targetSiblings, currentIndex, targetIndex);

        field.formId = targetParent.formId;
        field.parentFieldId = targetParent.fieldId;
        this._formChanged$.next(formId);
    }

    private _convertToEditorField(
        sourceField: IBaseFormlyField,
        formId: string,
        fieldMap?: Map<string, IEditorFormlyField>,
        parentFieldId?: string
    ): IEditorFormlyField {
        const typeOption: EditorTypeOption = this._getTypeOption(sourceField.type, sourceField.customType);

        // Special case to specify 'formly-group' type
        if (!sourceField.type && sourceField.fieldGroup) {
            sourceField.type = FieldType.FORMLY_GROUP;
        }

        // Assign default properties if missing
        const defaultField: IBaseFormlyField = this._fieldService.getDefaultConfig(sourceField.type, sourceField.customType);
        const mergedField: IBaseFormlyField = Object.assign(defaultField, sourceField);
        Object.assign(sourceField, mergedField);

        // Add editor wrapper
        if (sourceField.wrappers) {
            const index = sourceField.wrappers.indexOf(WrapperType.EDITOR);
            if (index < 0) {
                sourceField.wrappers.unshift(WrapperType.EDITOR);
            }
        } else {
            sourceField.wrappers = [WrapperType.EDITOR];
        }

        // Field properties
        const fieldProperties: IProperty[] = this._fieldService.getProperties(sourceField.type);
        // Check for 'wrappers' chip list property, make 'editor' unremovable
        const wrappersProperty: IChipListProperty = fieldProperties.find(property => property.key === 'wrappers') as IChipListProperty;
        if (wrappersProperty && wrappersProperty.type === PropertyType.CHIP_LIST) {
            if (!wrappersProperty.notRemovableOptions) {
                wrappersProperty.notRemovableOptions = [WrapperType.EDITOR];
            } else {
                wrappersProperty.notRemovableOptions.unshift(WrapperType.EDITOR);
            }
        }

        // Create editor field
        const field: IEditorFormlyField = {
            ...sourceField,
            name: typeOption.displayName,
            fieldGroup: undefined,
            formId,
            fieldId: this._getNextFieldId(sourceField.type),
            parentFieldId,
            canHaveChildren: typeOption.canHaveChildren,
            childrenPath: typeOption.childrenPath,
            fieldProperties,
        };

        // Update fieldMap with field if provided
        if (fieldMap) {
            fieldMap.set(field.fieldId, field);
        }

        // Process children (e.g. 'fieldGroup')
        if (typeOption.canHaveChildren) {
            const sourceChildren: IBaseFormlyField[] = get(sourceField, typeOption.childrenPath);
            const children: IEditorFormlyField[] = sourceChildren?.map(child =>
                this._convertToEditorField(child, formId, fieldMap, field.fieldId)
            );
            set(field, typeOption.childrenPath, children);
        }


        return field;
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
			return this.getChildren(parentField);
		} else {
        	const form: IForm = this.getForm(formId);
			return form.fields;
		}
	}

	private _addForm(id: string, name: string, fields: IEditorFormlyField[], fieldMap: Map<string, IEditorFormlyField>) {
        this.forms.push({
			id,
			name,
			fields,
			fieldMap,
			activeField: fields[0],
			model: {}
		});
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
