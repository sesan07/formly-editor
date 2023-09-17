import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { get, set } from 'lodash-es';

import {
    EDITOR_FIELD_SERVICE,
    IEditorFieldService,
    IForm,
    IBaseFormlyField,
    EditorConfig,
    FieldTypeOption,
    IEditorFormlyField,
    FieldOption,
} from './editor.types';
import { Store } from '@ngrx/store';
import { IEditorState } from './state/state.types';
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
import { selectActiveField, selectActiveFieldMap, selectForms } from './state/state.selectors';
import { IProperty, IPropertyChange } from './property/property.types';
import { isCategoryOption } from './editor.utils';

@Injectable()
export class EditorService {
    public fieldOptions: FieldOption[];
    public typeOptions: FieldTypeOption[];

    private _forms: IForm[];
    private _activeField: IEditorFormlyField;
    private _activeFieldMap: Record<string, IEditorFormlyField>;
    private _keyPathMap: Record<string, string> = {}; // Record<formId.fieldId, keyPath>

    private _editorConfig: EditorConfig;

    constructor(
        @Inject(EDITOR_FIELD_SERVICE) private _fieldService: IEditorFieldService,
        private _http: HttpClient,
        private _store: Store<IEditorState>
    ) {
        this._store.select(selectForms).subscribe(forms => (this._forms = forms));
        this._store.select(selectActiveField).subscribe(field => (this._activeField = field));
        this._store.select(selectActiveFieldMap).subscribe(fieldMap => (this._activeFieldMap = fieldMap));
    }

    public get defaultUnknownType(): string {
        return this._editorConfig.defaultUnknownType;
    }

    setup(editorConfig: EditorConfig) {
        this._editorConfig = editorConfig;
        const getTypeOptions = (options: FieldOption[]) =>
            options.reduce<FieldTypeOption[]>(
                (a, b): FieldTypeOption[] => [...a, ...(isCategoryOption(b) ? getTypeOptions(b.children) : [b])],
                []
            );
        this.fieldOptions = this._editorConfig.options;
        this.typeOptions = getTypeOptions(this.fieldOptions);
        this._loadDefaultForm();
    }

    public addForm(name: string, sourceFields?: IBaseFormlyField[], model?: Record<string, unknown>): void {
        this._store.dispatch(
            addForm({
                name,
                sourceFields,
                model,
                typeOptions: this.typeOptions,
                defaultUnknownType: this.defaultUnknownType,
                getDefaultField: (type: string) => this._fieldService.getDefaultField(type),
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
                typeOptions: this.typeOptions,
                defaultUnknownType: this.defaultUnknownType,
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

    // Move field within a parent field in a form
    public moveField(fieldId: string, from: number, to?: number): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const parent: IEditorFormlyField = this.getField(field._info.parentFieldId);
        this._store.dispatch(moveField({ parent, from, to }));
    }

    public replaceField(newFieldType: string, fieldId: string): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const parent: IEditorFormlyField = this.getField(field._info.parentFieldId);

        this._store.dispatch(
            replaceField({
                field,
                parent,
                newFieldType,
                typeOptions: this.typeOptions,
                defaultUnknownType: this.defaultUnknownType,
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

    public getDefaultField(type: string): IBaseFormlyField {
        return this._fieldService.getDefaultField(type);
    }

    public getFieldProperties(type: string): IProperty[] {
        return this._fieldService.getProperties(type);
    }

    public registerKeyPath({ _info: { formId, fieldId } }: IEditorFormlyField, keyPath: string): void {
        set(this._keyPathMap, [`${formId}.${fieldId}`], keyPath);
    }

    private _getKeyPath({ _info: { formId, fieldId } }: IEditorFormlyField): string | undefined {
        return get(this._keyPathMap, [`${formId}.${fieldId}`]);
    }

    private _loadDefaultForm(): void {
        forkJoin([
            this._http.get<IBaseFormlyField | IBaseFormlyField[]>('assets/default.fields.json').pipe(
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
}
