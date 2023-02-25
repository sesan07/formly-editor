import { Component, OnInit, TrackByFunction } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { EditorService } from '../editor.service';
import { IForm, IEditorFormlyField, EditorTypeCategoryOption } from '../editor.types';
import { trackByFieldId } from '../editor.utils';
import { AddFormDialogComponent } from '../form/add-form-dialog/add-form-dialog.component';
import { AddFormResponse } from '../form/add-form-dialog/add-json-dialog.types';
import { ExportFormDialogComponent } from '../form/export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from '../form/export-form-dialog/export-json-dialog.types';
import { cleanField } from '../form/form.utils';
import { ImportModelDialogComponent } from '../form/import-model-dialog/import-model-dialog.component';
import { ImportModelResponse } from '../form/import-model-dialog/import-model-dialog.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { PropertyService } from '../property/property.service';
import { IPropertyChange, PropertyType } from '../property/property.types';
import { initRootProperty } from '../property/utils';
import { FileService } from '../shared/services/file-service/file.service';
import { SideBarPosition } from '../sidebar/sidebar.types';
import {
    selectForms,
    selectActiveForm,
    selectActiveFormIndex,
    selectActiveField,
    selectActiveModel,
} from '../state/state.selectors';
import { IEditorState } from '../state/state.types';

@Component({
    selector: 'editor-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
    public forms$: Observable<ReadonlyArray<IForm>>;
    public activeFormIndex$: Observable<number>;
    public activeField$: Observable<IEditorFormlyField>;
    public resizeEnd$: Observable<void>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public showSidebars = true;
    public toolbarTabIndex: 0 | 1 = 0;

    public activeForm: IForm;
    public activeModel: Record<string, unknown>;
    public modelProperty: IObjectProperty;
    public fieldCategories: EditorTypeCategoryOption[];

    trackByFieldId = trackByFieldId;

    private _destroy$: Subject<void> = new Subject();
    private _resizeEnd$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _store: Store<IEditorState>,
        private _dialog: MatDialog,
        private _fileService: FileService,
        private _propertyService: PropertyService
    ) {}

    trackFormById: TrackByFunction<IForm> = (_, form: IForm) => form.id;

    ngOnInit(): void {
        this.forms$ = this._store.select(selectForms).pipe(takeUntil(this._destroy$));
        this.activeFormIndex$ = this._store.select(selectActiveFormIndex).pipe(takeUntil(this._destroy$));
        this.activeField$ = this._store.select(selectActiveField).pipe(takeUntil(this._destroy$));
        this._store
            .select(selectActiveForm)
            .pipe(takeUntil(this._destroy$))
            .subscribe(form => (this.activeForm = form));
        this._store
            .select(selectActiveModel)
            .pipe(takeUntil(this._destroy$))
            .subscribe(model => (this.activeModel = model));
        this.modelProperty = this._getModelProperty();
        this.fieldCategories = this._editorService.fieldCategories;
    }

    onAddForm(): void {
        const dialogRef: MatDialogRef<AddFormDialogComponent, AddFormResponse> =
            this._dialog.open(AddFormDialogComponent);

        dialogRef.afterClosed().subscribe(res => {
            if (res?.json) {
                const parsed = JSON.parse(res.json);
                this._editorService.addForm(res.name, Array.isArray(parsed) ? parsed : [parsed]);
            } else if (res) {
                this._editorService.addForm(res.name);
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

        const config: MatDialogConfig<ExportJSONRequest> = {
            data: {
                type: 'Form',
                name: this.activeForm.name + '.json',
                json: JSON.stringify(fieldsClone, null, 2),
            },
        };

        const dialogRef: MatDialogRef<ExportFormDialogComponent, ExportJSONResponse> = this._dialog.open(
            ExportFormDialogComponent,
            config
        );

        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._fileService.saveFile(res.name, res.json);
            }
        });
    }

    onAddField(type: string, customType?: string): void {
        this._editorService.addField(type, customType);
    }
    onActiveFieldChanged(change: IPropertyChange): void {
        this._editorService.modifyActiveField(change);
    }

    onActiveModelChanged(change: IPropertyChange): void {
        this._editorService.modifyActiveModel(change);
    }

    onImportModel(): void {
        const dialogRef: MatDialogRef<ImportModelDialogComponent, ImportModelResponse> =
            this._dialog.open(ImportModelDialogComponent);
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._editorService.setActiveModel(JSON.parse(res.json));
            }
        });
    }

    onExportModel(): void {
        const config: MatDialogConfig<ExportJSONRequest> = {
            data: {
                type: 'Model',
                name: this.activeForm.name + '.model.json',
                json: JSON.stringify(this.activeModel, null, 2),
            },
        };

        const dialogRef: MatDialogRef<ExportFormDialogComponent, ExportJSONResponse> = this._dialog.open(
            ExportFormDialogComponent,
            config
        );
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._fileService.saveFile(res.name, res.json);
            }
        });
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

    private _getModelProperty(): IObjectProperty {
        const property = this._propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        initRootProperty(property);
        return property;
    }
}
