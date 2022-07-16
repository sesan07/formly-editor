import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { EditorService } from '../../services/editor-service/editor.service';
import { IEditorFormlyField, IForm } from '../../services/editor-service/editor.types';
import { PropertyType } from '../property/property.types';
import { PropertyService } from '../property/property.service';
import { ExportFormDialogComponent } from './export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from './export-form-dialog/export-json-dialog.types';
import { FileService } from '../../services/file-service/file.service';
import { SideBarPosition } from '../sidebar/sidebar.types';
import { IArrayProperty } from '../property/object-array-properties/array-property.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { ImportFormDialogComponent } from './import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from './import-form-dialog/import-json-dialog.types';
import { getFormattedFieldName } from '../../utils';

@Component({
	selector: 'editor-form',
	templateUrl: './form.component.html',
	styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
	@Input() form: IForm;

    public activeField: IEditorFormlyField;

	public activeFieldProperty: IObjectProperty;
    public activeFieldTarget: IEditorFormlyField;
	public modelProperty: IObjectProperty;
    public modelTarget: Record<string, any>;

    public activeFieldTargetChange$: Subject<void> = new Subject();
    public modelTargetChange$: Subject<void> = new Subject();

	public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public isAdvanced = true;
    public showSidebars = true;

    public fields: IEditorFormlyField[];
    public fieldsJSON: string;
    public formGroup: FormGroup = new FormGroup({});
    public options: FormlyFormOptions = {};
    public selectedFormDisplay: 'form' | 'json' = 'form';

	private _resizeEnd$: Subject<void> = new Subject();
	private _destroy$: Subject<void> = new Subject();

    private readonly _debounceTime: number = 1000;

	constructor(
		public propertyService: PropertyService,
		public editorService: EditorService,
        private _dialog: MatDialog,
        private _fileService: FileService
    ) { }

    public get formDisplayTabIndex(): number {
        switch (this.selectedFormDisplay) {
            case 'form': return 0;
            case 'json': return 1;
        }
    }

	public get resizeEnd$(): Observable<void> {
		return this._resizeEnd$.asObservable();
	}

	public ngOnInit(): void {
        this._updateModelProperty();
        this._updateModelTarget();
        this._updateFormFields();

		this.editorService.formChanged$
			.pipe(takeUntil(this._destroy$))
			.subscribe(formId => {
                if (formId === this.form.id) {
                    this._updateFormFields();
                }
            });

		this.form.activeField$
            .pipe(takeUntil(this._destroy$))
            .subscribe(field => {
                this.activeField = field;
                this._updateActiveFieldProperty();
                this._updateActiveFieldTarget();
            });

        this.activeFieldTargetChange$
            .pipe(debounceTime(this._debounceTime))
            .subscribe(() => this._updateActiveField());

        this.modelTargetChange$
            .pipe(debounceTime(this._debounceTime))
            .subscribe(() => this._updateFormModel());
	}

	public ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

    getFormattedFieldName = (f: IEditorFormlyField) => getFormattedFieldName(f);

    onModelChanged(model: Record<string, unknown>): void {
        this.form.model = cloneDeep(model);
        this._updateModelTarget();
    }

    onImportModel(): void {
        const config: MatDialogConfig<ImportJSONRequest> = {
            data: { type: 'Model' }
        };

        const dialogRef: MatDialogRef<ImportFormDialogComponent, ImportJSONResponse> = this._dialog.open(ImportFormDialogComponent, config);

        dialogRef.afterClosed()
            .subscribe(res => {
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
                json: JSON.stringify(this.form.model, null, 2)
            }
        };

        const dialogRef: MatDialogRef<ExportFormDialogComponent, ExportJSONResponse> = this._dialog.open(ExportFormDialogComponent, config);

        dialogRef.afterClosed()
            .subscribe(res => {
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

    private _updateFormFields(): void {
        this.fields = cloneDeep(this.form.fields);
		this.formGroup = new FormGroup({});
		this.options = {};

        const fieldsClone: IEditorFormlyField[] = cloneDeep(this.form.fields);
        fieldsClone.forEach(field => this.editorService.cleanField(field, true, true));
        this.fieldsJSON = JSON.stringify(fieldsClone, null, 2);
    }

    private _updateFormModel(): void {
        this.form.model = cloneDeep(this.modelTarget);
    }

	private _updateActiveFieldProperty(): void {
		this.activeFieldProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this._initRootProperty(this.activeFieldProperty);
		this.activeFieldProperty.childProperties = this.activeField.properties;
		this.activeFieldProperty.populateChildrenFromTarget = false;
		this.activeFieldProperty.addOptions = [];
	}

    private _updateActiveFieldTarget(): void {
        this.activeFieldTarget = cloneDeep(this.activeField);
    }

    private _updateActiveField(): void {
        this.editorService.updateField(this.activeFieldTarget);
    }

	private _updateModelProperty(): void {
		this.modelProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this._initRootProperty(this.modelProperty);
	}

    private _updateModelTarget(): void {
        this.modelTarget = cloneDeep(this.form.model);
    }

	private _initRootProperty(property: IArrayProperty | IObjectProperty) {
		property.name = 'root';
		property.key = undefined;
		property.isRemovable = false;
		property.isKeyEditable = false;
	}
}
