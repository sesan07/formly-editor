import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { get, merge, set } from 'lodash-es';
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
        private _http: HttpClient
    ) {}

    public get forms$(): Observable<IForm[]> { return this._forms$.asObservable(); }
    public get formChanged$(): Observable<string> { return this._formChanged$.asObservable(); }
    public get fieldCategories(): EditorTypeCategoryOption[] { return this._editorConfig.typeCategories; };

    setup(editorConfig: EditorConfigOption) {
        this._editorConfig = editorConfig;
        this._editorConfig.typeCategories.forEach(category => this._fieldtypeOptions.push(...category.typeOptions));
        this._loadDefaultForm();
    }

    public addForm(name: string): void {
        const formId: string = this._getNextFormId(this._currFormId++);
        const field: IEditorFormlyField = this.getDefaultField(
            formId,
            this._editorConfig.defaultName,
            this._editorConfig.defaultCustomName
        );

		this._addForm(formId, name, [field], new Map());
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
                const editorField: IEditorFormlyField = this._convertToEditorField(formId, field);
                fields.push(editorField);
            });
        } else {
            const editorField: IEditorFormlyField = this._convertToEditorField(formId, loadedForm);
            fields.push(editorField);
        }

		this._addForm(formId, name, fields, fieldMap, model);
    }

    public removeForm(index: number): void {
        const forms: IForm[] = this._forms$.value;
        forms.splice(index, 1);
        this._forms$.next(forms.slice());
    }

    public getDefaultField(formId: string, type: string, customType?: string, parentFieldId?: string): IEditorFormlyField {
        const defaultField: IBaseFormlyField = this._fieldService.getDefaultConfig(type, customType);
        return this._convertToEditorField(formId, defaultField, parentFieldId);
    }

    public getTypeOption(type: string, customType?: string): EditorTypeOption {
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

    private _convertToEditorField(
        formId: string,
        sourceField: IBaseFormlyField,
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
        const typeOption: EditorTypeOption = this.getTypeOption(baseField.type, baseField.customType);
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
                this._convertToEditorField(formId, child, field.fieldId)
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
                model: model ?? {},
            }
        ]);
	}
}
