import { AfterViewInit, Component, Input, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';

import { StylesService } from './edit-field/styles/styles.service';
import { IStylesConfig } from './edit-field/styles/styles.types';
import { EditorService } from './editor.service';
import { FieldOption, IDefaultForm, IEditorFormlyField, IForm } from './editor.types';
import { isCategoryOption, isTypeOption, trackByDisplayName, trackByFieldId } from './editor.utils';
import { cleanField } from './form/form.utils';
import { JSONDialogComponent } from './json-dialog/json-dialog.component';
import { ImportJSONData, ImportJSONValue } from './json-dialog/json-dialog.types';
import { IObjectProperty } from './property/object-array-properties/object-property.types';
import { PropertyService } from './property/property.service';
import { IPropertyChange, PropertyType } from './property/property.types';
import { initRootProperty } from './property/utils';
import { FileService } from './shared/services/file-service/file.service';
import { SideBarPosition } from './sidebar/sidebar.types';
import { initialState } from './state/state.reducers';
import {
    selectActiveField,
    selectActiveForm,
    selectActiveFormIndex,
    selectActiveModel,
    selectEditor,
    selectForms,
} from './state/state.selectors';
import { IEditorState } from './state/state.types';

@Component({
    selector: 'editor-main',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() defaultForm?: IDefaultForm;
    @Input() stylesConfig?: IStylesConfig;
    @Input() autosaveStorageKey = 'editor';
    @Input() autosaveDelay = 0;

    public forms$: Observable<ReadonlyArray<IForm>>;
    public activeFormIndex$: Observable<number>;
    public activeField$: Observable<IEditorFormlyField>;
    public resizeEnd$: Observable<void>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public showSidebars = true;
    public toolbarTabIndex: 0 | 1 = 0;

    public activeForm: IForm;
    public activeModel: object;
    public modelProperty: IObjectProperty;
    public fieldOptions: FieldOption[];

    public canShowMain = false;

    trackByFieldId = trackByFieldId;
    trackByDisplayName = trackByDisplayName;
    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    private _resizeEnd$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _store: Store<IEditorState>,
        private _dialog: MatDialog,
        private _fileService: FileService,
        private _propertyService: PropertyService,
        private _stylesService: StylesService
    ) {}

    trackFormById: TrackByFunction<IForm> = (_, form: IForm) => form.id;

    ngOnInit(): void {
        this._loadState();

        this.forms$ = this._store.select(selectForms);
        this.activeFormIndex$ = this._store.select(selectActiveFormIndex).pipe(
            debounceTime(0) // allows tab header to render properly when non-zero index on startup
        );
        this.activeField$ = this._store.select(selectActiveField);
        this._store
            .select(selectActiveForm)
            .pipe(takeUntil(this._destroy$))
            .subscribe(form => (this.activeForm = form));
        this._store
            .select(selectActiveModel)
            .pipe(takeUntil(this._destroy$))
            .subscribe(model => (this.activeModel = model));
        this.modelProperty = this._getModelProperty();
        this.fieldOptions = this._editorService.fieldOptions;

        this._stylesService.setup(this.stylesConfig);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.canShowMain = true;
        }, 250);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddForm(): void {
        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Add Form',
                primaryActionText: 'Add',
                name: {
                    placeholder: 'Form Name',
                },
                defaultValue: {
                    json: '[]',
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                const parsed = JSON.parse(res.json);
                this._editorService.addForm(res.name, Array.isArray(parsed) ? parsed : [parsed]);
            }
        });
    }

    onRemoveForm(index: number): void {
        this._editorService.removeForm(index);
    }

    onTabChange(index: number): void {
        this._editorService.setActiveForm(index);
    }

    onTabLabelMouseDown(event: MouseEvent, index: number): void {
        if (event.button === 1) {
            this.onRemoveForm(index);
        }
    }

    onDuplicateForm(): void {
        this._editorService.duplicateForm(this.activeForm.id);
    }

    onExportForm(): void {
        const fieldsClone: IEditorFormlyField[] = cloneDeep(this.activeForm.fields);
        fieldsClone.forEach(field => cleanField(field, true, true));

        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Export Form',
                primaryActionText: 'Export',
                name: {
                    placeholder: 'file-name.json',
                    pattern: /.+\.json$/,
                },
                defaultValue: {
                    name: this.activeForm.name + '.json',
                    json: JSON.stringify(fieldsClone, null, 2),
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._fileService.saveFile(res.name, res.json);
            }
        });
    }

    onAddField(type: string): void {
        this._editorService.addField(type);
    }
    onActiveFieldChanged(change: IPropertyChange): void {
        this._editorService.modifyActiveField(change);
    }

    onActiveModelChanged(change: IPropertyChange): void {
        this._editorService.modifyActiveModel(change);
    }

    onImportModel(): void {
        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Import Model',
                primaryActionText: 'Import',
                canSelectFile: true,
                defaultValue: {
                    json: '{}',
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._editorService.setActiveModel(JSON.parse(res.json));
            }
        });
    }

    onExportModel(): void {
        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Export Model',
                primaryActionText: 'Export',
                name: {
                    placeholder: 'file-name.json',
                    pattern: /.+\.json$/,
                },
                defaultValue: {
                    name: this.activeForm.name + '.model.json',
                    json: JSON.stringify(this.activeModel, null, 2),
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._fileService.saveFile(res.name, res.json);
            }
        });
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

    loadDefaultForm(): void {
        this._editorService.addForm(this.defaultForm.name, this.defaultForm.fields, this.defaultForm.model);
    }

    private _loadState(): void {
        const storedState = localStorage.getItem(this.autosaveStorageKey);
        if (storedState) {
            this._editorService.setState(JSON.parse(storedState));
        } else {
            this._editorService.setState(initialState);
        }

        this._store
            .select(selectEditor)
            .pipe(takeUntil(this._destroy$), debounceTime(this.autosaveDelay))
            .subscribe(state => localStorage.setItem(this.autosaveStorageKey, JSON.stringify(state)));
    }

    private _getModelProperty(): IObjectProperty {
        const property = this._propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        initRootProperty(property);
        return property;
    }
}
