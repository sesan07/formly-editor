import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { get, set } from 'lodash-es';
import { forkJoin, of } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FormlyFieldConfig } from '@ngx-formly/core';

import {
    EDITOR_CONFIG,
    EditorConfig,
    EditorFieldType,
    FieldOption,
    FieldTypeOption,
    IEditorFieldService,
    IEditorFormlyField,
    IForm,
} from './editor.types';
import { isCategoryOption } from './editor.utils';
import { GenericFieldService } from './field-service/generic/generic-field.service';
import { IProperty, IPropertyChange } from './property/property.types';
import {
    addField,
    addForm,
    duplicateForm,
    modifyActiveField,
    modifyActiveModel,
    moveField,
    removeField,
    removeForm,
    replaceField,
    setActiveField,
    setActiveFormId,
    setActiveModel,
    setEditMode,
} from './state/state.actions';
import { selectActiveField, selectActiveFieldMap, selectEditor, selectForms } from './state/state.selectors';
import { IEditorState } from './state/state.types';

@Injectable()
export class EditorService {
    public config: EditorConfig;
    public fieldOptions: FieldOption[];

    private _forms: IForm[] = [];
    private _activeField: IEditorFormlyField;
    private _activeFieldMap: Record<string, IEditorFormlyField>;
    private _keyPathMap: Record<string, string> = {}; // Record<formId.fieldId, keyPath>
    private _typeOptions: FieldTypeOption[];
    private _fieldServiceMap: Record<string, IEditorFieldService> = {}; // Record<type, service>

    private readonly _defaultTypeOption: FieldTypeOption = {
        displayName: 'Generic',
        type: EditorFieldType.GENERIC,
        disableKeyGeneration: true,
        service: GenericFieldService,
    };

    private readonly _stateStoragekey = 'editor';
    private readonly _defaultAutosaveDelay = 5000;

    constructor(
        @Inject(EDITOR_CONFIG) config: EditorConfig,
        private _http: HttpClient,
        private _store: Store<IEditorState>
    ) {
        this.setup(config);
    }

    setup(config: EditorConfig) {
        this.config = config;

        this._store.select(selectForms).subscribe(forms => (this._forms = forms));
        this._store.select(selectActiveField).subscribe(field => (this._activeField = field));
        this._store.select(selectActiveFieldMap).subscribe(fieldMap => (this._activeFieldMap = fieldMap));
        this._store
            .select(selectEditor)
            .pipe(debounceTime(this.config.autosaveDelay ?? this._defaultAutosaveDelay))
            .subscribe(state => this._saveState(state));

        this.fieldOptions = [...this.config.options, this._defaultTypeOption];
        const getTypeOptions = (options: FieldOption[]) =>
            options.reduce<FieldTypeOption[]>(
                (a, b): FieldTypeOption[] => [...a, ...(isCategoryOption(b) ? getTypeOptions(b.children) : [b])],
                []
            );
        this._typeOptions = getTypeOptions(this.fieldOptions);
        this._fieldServiceMap = this._typeOptions.reduce((acc, o) => ({ ...acc, [o.type]: inject(o.service) }), {});

        if (!this._forms.length) {
            this._loadDefaultForm();
        }
    }

    public addForm(name: string, sourceFields?: FormlyFieldConfig[], model?: object): void {
        this._store.dispatch(
            addForm({
                name,
                sourceFields,
                model,
                typeOptions: this._typeOptions,
                defaultTypeOption: this._defaultTypeOption,
                getDefaultField: (type: string) => this._getFieldService(type).getDefaultField(type),
            })
        );
    }

    public removeForm(index: number): void {
        this._store.dispatch(removeForm({ formId: this._forms[index].id }));
    }

    public duplicateForm(formId: string): void {
        this._store.dispatch(duplicateForm({ formId }));
    }

    public setActiveForm(index: number): void {
        this._store.dispatch(setActiveFormId({ activeFormId: this._forms[index].id }));
    }

    public setEditMode(formId: string, isEditMode: boolean): void {
        this._store.dispatch(setEditMode({ formId, isEditMode }));
    }

    public addField(fieldType: string, parentId?: string, index?: number): void {
        const parent: IEditorFormlyField = this.getField(parentId);
        this._store.dispatch(
            addField({
                fieldType,
                parent,
                index,
                typeOptions: this._typeOptions,
                defaultTypeOption: this._defaultTypeOption,
                getDefaultField: type => this.getDefaultField(type),
            })
        );
    }

    public removeField(fieldId: string, parentId?: string): void {
        const field = this.getField(fieldId);
        const parent = this.getField(parentId);
        this._store.dispatch(removeField({ fieldId, parent, keyPath: this._getKeyPath(field) }));
    }

    public modifyActiveField(change: IPropertyChange) {
        if (!change.path) {
            throw new Error('Path is missing from field change');
        }

        this._store.dispatch(modifyActiveField({ activeField: this._activeField, change }));
    }

    public setActiveField(activeFieldId: string | null): void {
        this._store.dispatch(setActiveField({ activeFieldId }));
    }

    public moveField(
        sourceField: IEditorFormlyField,
        sourceParent: IEditorFormlyField | undefined,
        targetParent: IEditorFormlyField | undefined,
        sourceIndex: number,
        targetIndex: number | undefined
    ): void {
        this._store.dispatch(moveField({ sourceField, sourceParent, targetParent, sourceIndex, targetIndex }));
    }

    public replaceField(newFieldType: string, fieldId: string): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const parent: IEditorFormlyField = this.getField(field._info.parentFieldId);

        this._store.dispatch(
            replaceField({
                field,
                parent,
                newFieldType,
                typeOptions: this._typeOptions,
                defaultTypeOption: this._defaultTypeOption,
                keyPath: this._getKeyPath(field),
                getDefaultField: type => this.getDefaultField(type),
            })
        );
    }

    public setActiveModel(model: Record<string, any>): void {
        this._store.dispatch(setActiveModel({ model }));
    }

    public modifyActiveModel(change: IPropertyChange): void {
        this._store.dispatch(modifyActiveModel({ change }));
    }

    public getField(fieldId: string): IEditorFormlyField | undefined {
        return this._activeFieldMap?.[fieldId];
    }

    public getDefaultField(type: string): FormlyFieldConfig {
        return this._getFieldService(type).getDefaultField(type);
    }

    public getFieldProperties(type: string): IProperty[] {
        return this._getFieldService(type).getProperties(type);
    }

    public registerKeyPath({ _info: { formId, fieldId } }: IEditorFormlyField, keyPath: string): void {
        set(this._keyPathMap, [`${formId}.${fieldId}`], keyPath);
    }

    public onDisplayFields(fields: IEditorFormlyField[], model: Record<string, any>): IEditorFormlyField[] {
        return this.config.onDisplayFields?.(fields, model) ?? fields;
    }

    private _getKeyPath({ _info: { formId, fieldId } }: IEditorFormlyField): string | undefined {
        return get(this._keyPathMap, [`${formId}.${fieldId}`]);
    }

    private _getFieldService(type: string): IEditorFieldService {
        return this._fieldServiceMap[type] ?? this._fieldServiceMap[this._defaultTypeOption.type];
    }

    private _loadDefaultForm(): void {
        forkJoin([
            this._http.get<FormlyFieldConfig | FormlyFieldConfig[]>('assets/default.fields.json').pipe(
                map(data => (Array.isArray(data) ? data : [data])),
                catchError(() => {
                    console.warn('Unable to load default fields');
                    return of([]);
                })
            ),
            this._http.get<Record<string, unknown>>('assets/default.model.json').pipe(
                catchError(() => {
                    console.warn('Unable to load default model');
                    return of({});
                })
            ),
        ]).subscribe(([fields, model]) => {
            this.addForm('Form Zero', fields, model);
        });
    }

    private _saveState(state: IEditorState): void {
        localStorage.setItem(this._stateStoragekey, JSON.stringify(state));
    }
}
