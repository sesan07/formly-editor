import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { EDITOR_FIELD_SERVICE, IEditorFormlyField, IFieldService, IForm } from '../editor.types';
import { PropertyType } from '../property/property.types';
import { PropertyService } from '../property/property.service';
import { ExportFormDialogComponent } from './export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from './export-form-dialog/export-json-dialog.types';
import { FileService } from '../shared/services/file-service/file.service';
import { SideBarPosition } from '../sidebar/sidebar.types';
import { IArrayProperty } from '../property/object-array-properties/array-property.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { ImportFormDialogComponent } from './import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from './import-form-dialog/import-json-dialog.types';
import { cleanField, getFormattedFieldName } from './utils';
import { FormService } from './form.service';
import { DroplistService } from './droplist.service';

@Component({
    selector: 'editor-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    providers: [FormService, DroplistService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit, OnDestroy {
    @Input() form: IForm;

    public activeField: IEditorFormlyField;
    public activeFieldProperty: IObjectProperty;
    public activeFieldTarget: IEditorFormlyField;
    public activeFieldTargetChange$: Subject<void> = new Subject();

    public modelProperty: IObjectProperty;
    public modelTarget: Record<string, any>;
    public modelTargetChange$: Subject<void> = new Subject();

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public isAdvanced = true;
    public showSidebars = true;
    public toolbarTabIndex: 0 | 1 = 0;

    public formFields: IEditorFormlyField[];
    public formFieldsJSON: string;
    public formGroup: FormGroup = new FormGroup({});
    public options: FormlyFormOptions = {};

    private _resizeEnd$: Subject<void> = new Subject();
    private _destroy$: Subject<void> = new Subject();

    private readonly _debounceTime: number = 500;

    constructor(
        public propertyService: PropertyService,
        public editorService: EditorService,
        @Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService,
        private _formService: FormService,
        private _dialog: MatDialog,
        private _fileService: FileService,
        private _cdRef: ChangeDetectorRef
    ) {}

    public get resizeEnd$(): Observable<void> {
        return this._resizeEnd$.asObservable();
    }

    public get isEditMode$(): Observable<boolean> {
        return this._formService.isEditMode$;
    }

    public ngOnInit(): void {
        this._formService.setup(this.form);

        this._updateModelProperty();
        this._updateModelTarget();

        this._formService.fields$.pipe(takeUntil(this._destroy$)).subscribe(fields => this._updateFormFields(fields));
        this._formService.activeField$
            .pipe(takeUntil(this._destroy$))
            .subscribe(field => this._updateActiveField(field));

        this.activeFieldTargetChange$.pipe(debounceTime(this._debounceTime)).subscribe(() => this._modifyActiveField());
        this.modelTargetChange$.pipe(debounceTime(this._debounceTime)).subscribe(() => this._modifyFormModel());
    }

    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getFormattedFieldName = (f: IEditorFormlyField) => getFormattedFieldName(f);

    onEditModeChanged(isEditMode: boolean): void {
        this._formService.setEditMode(isEditMode);
    }

    onDuplicateForm(): void {
        this.editorService.duplicateForm(this.form.id);
    }

    onModelChanged(): void {
        this._updateModelTarget();
    }

    onImportModel(): void {
        const config: MatDialogConfig<ImportJSONRequest> = {
            data: { type: 'Model' },
        };

        const dialogRef: MatDialogRef<ImportFormDialogComponent, ImportJSONResponse> = this._dialog.open(
            ImportFormDialogComponent,
            config
        );
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.form.model = JSON.parse(res.json);
                this._updateModelTarget();
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
        this._updateModelTarget();
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

    private _updateFormFields(fields: IEditorFormlyField[]): void {
        this.formFields = cloneDeep(fields);
        this.formGroup = new FormGroup({});
        this.options = {};

        const fieldsClone: IEditorFormlyField[] = cloneDeep(fields);
        fieldsClone.forEach(field => cleanField(field, true, true));
        this.formFieldsJSON = JSON.stringify(fieldsClone, null, 2);
        this._cdRef.markForCheck();
    }

    private _modifyFormModel(): void {
        this.form.model = { ...this.modelTarget };
        this._cdRef.markForCheck();
    }

    private _updateActiveFieldProperty(): void {
        this.activeFieldProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        this._initRootProperty(this.activeFieldProperty);
        const properties = this._fieldService.getProperties(this.activeField.type);
        this.activeFieldProperty.childProperties = properties;
        this.activeFieldProperty.populateChildrenFromTarget = false;
        this.activeFieldProperty.addOptions = [];
        this._cdRef.markForCheck();
    }

    private _updateActiveField(field: IEditorFormlyField): void {
        this.activeField = field;
        this.activeFieldTarget = { ...this.activeField };
        this._updateActiveFieldProperty();
    }

    private _modifyActiveField(): void {
        this._formService.modifyField(this.activeFieldTarget);
        this._cdRef.markForCheck();
    }

    private _updateModelProperty(): void {
        this.modelProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        this._initRootProperty(this.modelProperty);
        this._cdRef.markForCheck();
    }

    private _updateModelTarget(): void {
        this.modelTarget = { ...this.form.model };
        this._cdRef.markForCheck();
    }

    private _initRootProperty(property: IArrayProperty | IObjectProperty) {
        property.name = 'root';
        property.key = undefined;
        property.isRemovable = false;
        property.isKeyEditable = false;
    }
}
