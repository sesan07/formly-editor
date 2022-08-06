import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { IEditorFormlyField, IForm } from '../editor.types';
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
    public activeFieldParent: IEditorFormlyField;

    public activeFieldProperty: IObjectProperty;
    public activeFieldTarget: IEditorFormlyField;
    public modelProperty: IObjectProperty;
    public modelTarget: Record<string, any>;

    public activeFieldTargetChange$: Subject<void> = new Subject();
    public modelTargetChange$: Subject<void> = new Subject();
    public isEditMode$: Observable<boolean>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public isAdvanced = true;
    public showSidebars = true;

    public formFields: IEditorFormlyField[];
    public formFieldsJSON: string;
    public formGroup: FormGroup = new FormGroup({});
    public options: FormlyFormOptions = {};
    public selectedFormDisplay: 'form' | 'json' = 'form';

    private _resizeEnd$: Subject<void> = new Subject();
    private _destroy$: Subject<void> = new Subject();

    private readonly _debounceTime: number = 500;

    constructor(
        public propertyService: PropertyService,
        public editorService: EditorService,
        private _formService: FormService,
        private _dialog: MatDialog,
        private _fileService: FileService,
        private _cdRef: ChangeDetectorRef
    ) {}

    public get formDisplayTabIndex(): number {
        switch (this.selectedFormDisplay) {
            case 'form':
                return 0;
            case 'json':
                return 1;
        }
    }

    public get resizeEnd$(): Observable<void> {
        return this._resizeEnd$.asObservable();
    }

    public ngOnInit(): void {
        this._formService.setup(this.form);
        this.isEditMode$ = this._formService.isEditMode$;

        this._updateModelProperty();
        this._updateModelTarget();

        this._formService.fields$.pipe(takeUntil(this._destroy$)).subscribe(fields => this._updateFormFields(fields));

        this._formService.activeField$.pipe(takeUntil(this._destroy$)).subscribe(field => {
            this.activeField = field;
            this.activeFieldParent = this._formService.getField(field.parentFieldId);
            this._updateActiveFieldProperty();
            this._updateActiveFieldTarget();
        });

        this.activeFieldTargetChange$.pipe(debounceTime(this._debounceTime)).subscribe(() => this._updateActiveField());

        this.modelTargetChange$.pipe(debounceTime(this._debounceTime)).subscribe(() => this._updateFormModel());
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

    private _updateFormModel(): void {
        this.form.model = { ...this.modelTarget };
        this._cdRef.markForCheck();
    }

    private _updateActiveFieldProperty(): void {
        this.activeFieldProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        this._initRootProperty(this.activeFieldProperty);
        this.activeFieldProperty.childProperties = this.activeField.properties;
        this.activeFieldProperty.populateChildrenFromTarget = false;
        this.activeFieldProperty.addOptions = [];
        this._cdRef.markForCheck();
    }

    private _updateActiveFieldTarget(): void {
        this.activeFieldTarget = { ...this.activeField };
        this._cdRef.markForCheck();
    }

    private _updateActiveField(): void {
        this._formService.updateField(this.activeFieldTarget);
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
