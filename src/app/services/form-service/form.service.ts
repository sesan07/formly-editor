import { Injectable } from '@angular/core';
import { FieldType, IEditorFormlyField, IForm, WrapperType } from './form.types';
import { cloneDeep, isEmpty } from 'lodash-es';
import { FileService } from '../file-service/file.service';
import { FormlyGroupService } from '../field-services/formly-group/formly-group.service';
import { Observable, Subject } from 'rxjs';
import { OtherFieldService } from '../field-services/other/other-field.service';
import { BaseFieldService } from '../field-services/base-field.service';
import { InputService } from '../field-services/input/input.service';
import { TextareaService } from '../field-services/textarea/textarea.service';
import { CheckboxService } from '../field-services/checkbox/checkbox.service';
import { RadioService } from '../field-services/radio/radio.service';
import { SelectService } from '../field-services/select/select.service';

@Injectable({
    providedIn: 'root',
})
export class FormService {
    public fieldTypes: FieldType[] = Object.values(FieldType);

    public forms: IForm[] = [];

    public get fieldAdded$(): Observable<IEditorFormlyField> {
        return this._fieldAdded$.asObservable();
    }

    public get fieldRemoved$(): Observable<IEditorFormlyField> {
        return this._fieldRemoved$.asObservable();
    }

    public get fieldSelected$(): Observable<IEditorFormlyField> {
        return this._fieldSelected$.asObservable();
    }

    private _currFormId = 1;
    private _fieldAdded$: Subject<IEditorFormlyField> = new Subject();
    private _fieldRemoved$: Subject<IEditorFormlyField> = new Subject();
    private _fieldSelected$: Subject<IEditorFormlyField> = new Subject();

    constructor(private _checkboxService: CheckboxService,
				private _formlyGroupService: FormlyGroupService,
                private _inputService: InputService,
                private _otherFieldService: OtherFieldService,
                private _radioService: RadioService,
                private _selectService: SelectService,
                private _textareaFieldService: TextareaService,
                private _fileService: FileService,
    ) {
        const formId: string = this._getNextFormId(this._currFormId);
        const formName: string = this._getNextFormName(this._currFormId);
        this._currFormId++;

		this._addForm(formId, formName, [], new Map());
		this.addField(FieldType.FORMLY_GROUP, formId);
    }

    public addField(type: FieldType, formId: string, parentId?: string, index?: number): IEditorFormlyField {
        const form: IForm = this.forms.find(f => f.id === formId);
		const fieldService: BaseFieldService<any> = this._getFieldService(type);
		const newField: IEditorFormlyField = fieldService.getDefaultConfig(formId, parentId);
		form.fieldMap.set(newField.fieldId, newField);

		const siblings: IEditorFormlyField[] = this._getSiblings(formId, parentId);
		if (typeof index === 'number') {
			siblings.splice(index, 0, newField);
		} else {
			siblings.push(newField);
		}

		this._fieldAdded$.next(newField);
		this.selectField(formId, newField.fieldId);

		return newField;
    }

    public removeField(formId: string, fieldId: string, parentId?: string): void {
        const form: IForm = this.forms.find(f => f.id === formId);
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, parentId);

        const index: number = siblings.findIndex(field => field.fieldId === fieldId);
        if (index !== -1) {
            siblings.splice(index, 1);
			const childField: IEditorFormlyField = this.getField(formId, fieldId);

            form.fieldMap.delete(fieldId);
			this._fieldRemoved$.next(childField);

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

	public replaceParentField(replaceType: FieldType, formId: string, fieldId: string): void {
		const field: IEditorFormlyField = this.getField(formId, fieldId);
		const siblings: IEditorFormlyField[] = this._getSiblings(formId, field.parentFieldId);
		const index: number = siblings.findIndex(f => f.fieldId === fieldId);
		const children = this.getChildren(field);

		this.removeField(formId, fieldId, field.parentFieldId);
		const newField: IEditorFormlyField = this.addField(replaceType, formId, field.parentFieldId, index);

		// Copy children to new field's children
		children.forEach(child => child.parentFieldId = newField.fieldId);
		const newChildren: IEditorFormlyField[] = this.getChildren(newField);
		newChildren.push(...children);
	}

	public isActiveField(formId: string, fieldId: string): boolean {
        const form: IForm = this.forms.find(f => f.id === formId);
		return form.activeField.fieldId === fieldId;
	}

    public getField(formId: string, fieldId: string): IEditorFormlyField {
        const form: IForm = this.forms.find(f => f.id === formId);
        return form.fieldMap.get(fieldId);
    }

    public uploadForm(): void {
        this._fileService.importJSONString()
            .subscribe(json => {
                if (json) {
                    this._loadJSONForm(json);
                }
            });
    }

    public downloadForm(index: number): void {
		const form: IForm = this.forms[index];
        const fieldsClone: IEditorFormlyField[] = cloneDeep(form.fields);
        fieldsClone.forEach(field => this.cleanField(field, true, true));
        // TODO add ability to export single line instead of 4-space formatted JSON, see if it still works... it should...
        this._fileService.exportJSONString(JSON.stringify(fieldsClone, null, 4), 'form.json');
    }

    public removeForm(index: number): void {
        this.forms.splice(index, 1);
    }

	public cleanField(field: IEditorFormlyField, cleanChildren: boolean = true, removeEditorProperties?: boolean): void {
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

    public getFieldTypeName(type: FieldType): string {
        const fieldService: BaseFieldService<any> = this._getFieldService(type);
        return fieldService.name;
    }

    public getFormattedFieldName(name: string, key?: string | number | string[]): string {
		return `${name}${key ? ' (' + key + ')' : ''}`;
    }

	public canHaveChildren(field: IEditorFormlyField): boolean {
		return field.type === FieldType.FORMLY_GROUP;
	}

	public getParentFieldTypes(): FieldType[] {
		return [FieldType.FORMLY_GROUP];
	}

	public getChildren(field: IEditorFormlyField): IEditorFormlyField[] {
		switch(field.type) {
			case FieldType.FORMLY_GROUP: return field.fieldGroup;
			default: throw new Error('Field type cannot have children');
		}
	}

    private _getFieldService(type: FieldType): BaseFieldService<any> {
        switch (type) {
            case FieldType.CHECKBOX: return this._checkboxService;
            case FieldType.FORMLY_GROUP: return this._formlyGroupService;
            case FieldType.INPUT: return this._inputService;
            case FieldType.OTHER: return this._otherFieldService;
            case FieldType.RADIO: return this._radioService;
            case FieldType.SELECT: return this._selectService;
            case FieldType.TEXTAREA: return this._textareaFieldService;
            default:
				console.warn(`Unknown formly type: '${type}', treating as 'other' type`);
				return this._otherFieldService;
        }
    }

    private _getNextFormName(index: number): string {
        return 'Form ' + index;
    }

    private _getNextFormId(index: number): string {
        return 'form__' + index;
    }

	private _getSiblings(formId: string, parentFieldId?: string): IEditorFormlyField[] {
		if (parentFieldId) {
			const parentField: IEditorFormlyField = this.getField(formId, parentFieldId);
			return this.getChildren(parentField);
		} else {
        	const form: IForm = this.forms.find(f => f.id === formId);
			return form.fields;
		}
	}

    private _loadJSONForm(json: string): void {
        const loadedForm: IEditorFormlyField | IEditorFormlyField[] = JSON.parse(json);

        const id: string = this._getNextFormId(this._currFormId);
        const name: string = this._getNextFormName(this._currFormId);
        this._currFormId++;

        const fields: IEditorFormlyField[] = [];
        const fieldMap: Map<string, IEditorFormlyField> = new Map();
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

    private _addEditorProperties(
        field: IEditorFormlyField,
        fieldMap: Map<string, IEditorFormlyField>,
        formId: string,
        parentId?: string,
    ): void {
        if (!field.type && field.fieldGroup) {
            field.type = FieldType.FORMLY_GROUP;
        }

        const fieldService: BaseFieldService<any> = this._getFieldService(field.type);

        const supportedFieldType: FieldType = Object.values(FieldType).includes(field.type)
            ? field.type
            : FieldType.OTHER;

        field.name = fieldService.name;

        field.formId = formId;
        field.parentFieldId = parentId;
        field.fieldId = fieldService.getNextFieldId();
        fieldMap.set(field.fieldId, field);

		// TODO verify if keys are always requierd when not formly-group
        if (!field.key && supportedFieldType !== FieldType.FORMLY_GROUP) {
            field.key = fieldService.getNextKey();
        }

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

        field.fieldProperties = fieldService.getProperties();

        if (field.fieldGroup) {
            field.fieldGroup.forEach(fieldGroupChild => {
                this._addEditorProperties(fieldGroupChild, fieldMap, formId, field.fieldId);
            });
        }
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

    private _removeEditorProperties(field: IEditorFormlyField): void {
        delete field.name;
        delete field.formId;
        delete field.fieldId;
        delete field.parentFieldId;
        delete field.fieldProperties;

        const editorIndex: number = field.wrappers.indexOf(WrapperType.EDITOR);
        if (editorIndex !== -1) {
            field.wrappers.splice(editorIndex, 1);
        }
    }
}
