import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { IEditorFormlyField, IForm } from '../editor.types';
import { IPropertyChange, PropertyType } from '../property/property.types';
import { PropertyService } from '../property/property.service';
import { ExportFormDialogComponent } from './export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from './export-form-dialog/export-json-dialog.types';
import { FileService } from '../shared/services/file-service/file.service';
import { SideBarPosition } from '../sidebar/sidebar.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { cleanField } from './utils';
import { FormService } from './form.service';
import { DroplistService } from './droplist.service';
import { initRootProperty } from '../property/utils';
import { ImportModelDialogComponent } from './import-model-dialog/import-model-dialog.component';
import { ImportModelResponse } from './import-model-dialog/import-model-dialog.types';

@Component({
    selector: 'editor-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    providers: [FormService, DroplistService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
    @Input() form: IForm;

    public modelProperty: IObjectProperty;

    public fields$: Observable<IEditorFormlyField[]>;
    public activeField$: Observable<IEditorFormlyField>;
    public resizeEnd$: Observable<void>;
    public isEditMode$: Observable<boolean>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public isAdvanced = true;
    public showSidebars = true;
    public toolbarTabIndex: 0 | 1 = 0;

    public formFields$: Observable<IEditorFormlyField[]>;
    public formFieldsJSON$: Observable<string>;
    public model$: Observable<Record<string, any>>;
    public formGroup: FormGroup = new FormGroup({});
    public options: FormlyFormOptions = {};

    private _resizeEnd$: Subject<void> = new Subject();

    private readonly _debounceTime: number = 500;

    constructor(
        public propertyService: PropertyService,
        public editorService: EditorService,
        private _formService: FormService,
        private _dialog: MatDialog,
        private _fileService: FileService
    ) {}

    public ngOnInit(): void {
        this._formService.setup(this.form);

        this.resizeEnd$ = this._resizeEnd$.asObservable();
        this.fields$ = this._formService.fields$;
        this.activeField$ = this._formService.activeField$;
        this.model$ = this._formService.model$;
        this.isEditMode$ = this._formService.isEditMode$;

        this._setupModelProperty();

        this.formFields$ = this._formService.fields$.pipe(
            debounceTime(this._debounceTime),
            map(fields => cloneDeep(fields)),
            tap(() => {
                this.formGroup = new FormGroup({});
                this.options = {};
            })
        );

        this.formFieldsJSON$ = this._formService.fields$.pipe(
            map(fields => {
                const fieldsClone: IEditorFormlyField[] = cloneDeep(fields);
                fieldsClone.forEach(field => cleanField(field, true, true));
                return JSON.stringify(fieldsClone, null, 2);
            })
        );
    }

    onEditModeChanged(isEditMode: boolean): void {
        this._formService.setEditMode(isEditMode);
    }

    onDuplicateForm(): void {
        this.editorService.duplicateForm(this.form.id);
    }

    onExportForm(): void {
        const fieldsClone: IEditorFormlyField[] = cloneDeep(this._formService.getFields());
        fieldsClone.forEach(field => cleanField(field, true, true));

        const config: MatDialogConfig<ExportJSONRequest> = {
            data: {
                type: 'Form',
                name: this.form.name + '.json',
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

    onActiveFieldChanged(change: IPropertyChange): void {
        this._formService.modifyField(change);
    }

    onModelChanged(change: IPropertyChange): void {
        this._formService.modifyModel(change);
    }

    onFormModelChanged(model: Record<string, any>): void {
        this._formService.setModel(model);
    }

    onImportModel(): void {
        const dialogRef: MatDialogRef<ImportModelDialogComponent, ImportModelResponse> =
            this._dialog.open(ImportModelDialogComponent);
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._formService.setModel(JSON.parse(res.json));
            }
        });
    }

    onExportModel(): void {
        const config: MatDialogConfig<ExportJSONRequest> = {
            data: {
                type: 'Model',
                name: this.form.name + '.model.json',
                json: JSON.stringify(this.form.model, null, 2),
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

    onResetModel(): void {
        this.options.resetModel({});
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

    private _setupModelProperty(): void {
        this.modelProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        initRootProperty(this.modelProperty);
    }
}
