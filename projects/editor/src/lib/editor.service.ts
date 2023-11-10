import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { get, set } from 'lodash-es';

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
    setState,
} from './state/state.actions';
import { selectActiveField, selectActiveFieldMap, selectForms } from './state/state.selectors';
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

    constructor(
        @Inject(EDITOR_CONFIG) config: EditorConfig,
        private _fieldService: FieldService,
        private _store: Store<IEditorState>
    ) {
        this.setup(config);
    }

    setup(config: EditorConfig) {
        this.config = config;

        this._store.select(selectForms).subscribe(forms => (this._forms = forms));
        this._store.select(selectActiveField).subscribe(field => (this._activeField = field));
        this._store.select(selectActiveFieldMap).subscribe(fieldMap => (this._activeFieldMap = fieldMap));

        this.fieldOptions = [...this.config.fieldOptions, config.genericTypeOption];
        const getTypeOptions = (options: FieldOption[]) =>
            options.reduce<FieldTypeOption[]>(
                (a, b): FieldTypeOption[] => [...a, ...(isCategoryOption(b) ? getTypeOptions(b.children) : [b])],
                []
            );
        this._typeOptions = getTypeOptions(this.fieldOptions);
    }

    public setState(state: IEditorState): void {
        this._store.dispatch(setState({ state }));
    }

    public addForm(name: string, sourceFields?: FormlyFieldConfig[], model?: object): void {
        this._store.dispatch(
            addForm({
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
                defaultTypeOption: this.config.genericTypeOption,
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
                defaultTypeOption: this.config.genericTypeOption,
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
