import { Component, OnInit, TrackByFunction } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditorService } from '../editor.service';
import { IForm, IEditorFormlyField, EditorTypeCategoryOption } from '../editor.types';
import { trackByFieldId } from '../editor.utils';
import { cleanField } from '../form/form.utils';
import { JSONDialogComponent } from '../json-dialog/json-dialog.component';
import { ImportJSONData, ImportJSONValue } from '../json-dialog/json-dialog.types';
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

    private _getModelProperty(): IObjectProperty {
        const property = this._propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        initRootProperty(property);
        return property;
    }
}
