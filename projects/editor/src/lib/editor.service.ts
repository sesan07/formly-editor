import { Inject, Injectable } from '@angular/core';
import { Store, createFeatureSelector } from '@ngrx/store';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { get, set } from 'lodash-es';
import { debounceTime } from 'rxjs';

import { EDITOR_CONFIG, EditorConfig, FieldOption, FieldTypeOption, IEditorFormlyField, IForm } from './editor.types';
import { isCategoryOption } from './editor.utils';
import { FieldService } from './field-service/field.service';
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
import { EDITOR_FEATURE, EditorFeature } from './state/state.types';

@Injectable()
export class EditorService {
    public fieldOptions: FieldOption[];

    private _forms: IForm[] = [];
    private _activeField: IEditorFormlyField;
    private _activeFieldMap: Record<string, IEditorFormlyField>;
    private _keyPathMap: Record<string, string> = {}; // Record<formId.fieldId, keyPath>
    private _typeOptions: FieldTypeOption[];

    constructor(
        @Inject(EDITOR_CONFIG) public config: EditorConfig,
        @Inject(EDITOR_FEATURE) public feature: EditorFeature,
        private _fieldService: FieldService,
        private _store: Store
    ) {
        this.setup(config);
    }

    setup(config: EditorConfig) {
        this._store.select(this.feature.selectForms).subscribe(forms => (this._forms = forms));
        this._store.select(this.feature.selectActiveField).subscribe(field => (this._activeField = field));
        this._store.select(this.feature.selectActiveFieldMap).subscribe(fieldMap => (this._activeFieldMap = fieldMap));
        this._store
            .select(createFeatureSelector(config.id))
            .pipe(debounceTime(config.autoSaveDelay ?? 0))
            .subscribe(state => localStorage.setItem(this.config.id, JSON.stringify(state)));

        this.fieldOptions = [...this.config.fieldOptions, config.genericTypeOption];
        const getTypeOptions = (options: FieldOption[]) =>
            options.reduce<FieldTypeOption[]>(
                (a, b): FieldTypeOption[] => [...a, ...(isCategoryOption(b) ? getTypeOptions(b.children) : [b])],
                []
            );
        this._typeOptions = getTypeOptions(this.fieldOptions);
    }

    public addForm(name: string, sourceFields?: FormlyFieldConfig[], model?: object): void {
        this._store.dispatch(
            addForm({
                editorId: this.config.id,
                name,
                sourceFields,
                model,
                typeOptions: this._typeOptions,
                defaultTypeOption: this.config.genericTypeOption,
                getDefaultField: (type: string) => this._fieldService.getDefaultField(type),
            })
        );
    }

    public removeForm(index: number): void {
        this._store.dispatch(removeForm({ editorId: this.config.id, formId: this._forms[index].id }));
    }

    public duplicateForm(formId: string): void {
        this._store.dispatch(duplicateForm({ editorId: this.config.id, formId }));
    }

    public setActiveForm(index: number): void {
        this._store.dispatch(setActiveFormId({ editorId: this.config.id, activeFormId: this._forms[index].id }));
    }

    public setEditMode(formId: string, isEditMode: boolean): void {
        this._store.dispatch(setEditMode({ editorId: this.config.id, formId, isEditMode }));
    }

    public addField(fieldType: string, parentId?: string, index?: number): void {
        const parent: IEditorFormlyField = this.getField(parentId);
        this._store.dispatch(
            addField({
                editorId: this.config.id,
                fieldType,
                parent,
                index,
                typeOptions: this._typeOptions,
                defaultTypeOption: this.config.genericTypeOption,
                getDefaultField: type => this.getDefaultField(type),
            })
        );
    }

    public removeField(fieldId: string, parentId?: string): void {
        const field = this.getField(fieldId);
        const parent = this.getField(parentId);
        this._store.dispatch(
            removeField({ editorId: this.config.id, fieldId, parent, keyPath: this._getKeyPath(field) })
        );
    }

    public modifyActiveField(change: IPropertyChange) {
        if (!change.path) {
            throw new Error('Path is missing from field change');
        }

        this._store.dispatch(modifyActiveField({ editorId: this.config.id, activeField: this._activeField, change }));
    }

    public setActiveField(activeFieldId: string | null): void {
        this._store.dispatch(setActiveField({ editorId: this.config.id, activeFieldId }));
    }

    public moveField(
        sourceField: IEditorFormlyField,
        sourceParent: IEditorFormlyField | undefined,
        targetParent: IEditorFormlyField | undefined,
        sourceIndex: number,
        targetIndex: number | undefined
    ): void {
        this._store.dispatch(
            moveField({ editorId: this.config.id, sourceField, sourceParent, targetParent, sourceIndex, targetIndex })
        );
    }

    public replaceField(newFieldType: string, fieldId: string): void {
        const field: IEditorFormlyField = this.getField(fieldId);
        const parent: IEditorFormlyField = this.getField(field._info.parentFieldId);

        this._store.dispatch(
            replaceField({
                editorId: this.config.id,
                field,
                parent,
                newFieldType,
                typeOptions: this._typeOptions,
                defaultTypeOption: this.config.genericTypeOption,
                keyPath: this._getKeyPath(field),
                getDefaultField: type => this.getDefaultField(type),
            })
        );
    }

    public setActiveModel(model: Record<string, any>): void {
        this._store.dispatch(setActiveModel({ editorId: this.config.id, model }));
    }

    public modifyActiveModel(change: IPropertyChange): void {
        this._store.dispatch(modifyActiveModel({ editorId: this.config.id, change }));
    }

    public getField(fieldId: string): IEditorFormlyField | undefined {
        return this._activeFieldMap?.[fieldId];
    }

    public getDefaultField(type: string): FormlyFieldConfig {
        return this._fieldService.getDefaultField(type);
    }

    public getFieldProperties(field: FormlyFieldConfig): IProperty[] {
        return this._fieldService.getProperties(field);
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
}
