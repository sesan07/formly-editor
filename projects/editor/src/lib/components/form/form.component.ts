import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { EditorService } from '../../services/editor-service/editor.service';
import { IEditorFormlyField, IForm } from '../../services/editor-service/editor.types';
import { cloneDeep } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { PropertyType } from '../property/property.types';
import { PropertyService } from '../property/property.service';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { ImportFormDialogComponent } from '../import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from '../import-form-dialog/import-json-dialog.types';
import { ExportFormDialogComponent } from '../export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from '../export-form-dialog/export-json-dialog.types';
import { FileService } from '../../services/file-service/file.service';
import { SideBarPosition } from '../sidebar/sidebar.types';
import { IArrayProperty } from '../property/object-array-properties/array-property.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';

@Component({
	selector: 'lib-form',
	templateUrl: './form.component.html',
	styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
	@Input() form: IForm;

	public activeFieldProperty: IObjectProperty;
	public modelProperty: IObjectProperty;

	public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public isAdvanced = true;
    public showSidebars = true;

    public fields: IEditorFormlyField[];
    public fieldsJSON: string;
    public formGroup: FormGroup = new FormGroup({});
    public options: FormlyFormOptions = {};
    public formModel: Record<string, any> = {};
    public selectedFormDisplay: 'form' | 'json' = 'form';

	private _formChanged$: Subject<void> = new Subject();
	private _resetModel$: Subject<void> = new Subject();
	private _resizeEnd$: Subject<void> = new Subject();
	private _destroy$: Subject<void> = new Subject();

	constructor(
		public propertyService: PropertyService,
		public editorService: EditorService,
        private _dialog: MatDialog,
        private _fileService: FileService,
        private _fieldDropListService: FieldDroplistService) {
	}

	public get formChanged$(): Observable<void> {
		return this._formChanged$.asObservable();
	}
    public get formDisplayTabIndex(): number {
        switch (this.selectedFormDisplay) {
            case 'form': return 0;
            case 'json': return 1;
        }
    }

	public get resetModel$(): Observable<void> {
		return this._resetModel$.asObservable();
	}
	public get resizeEnd$(): Observable<void> {
		return this._resizeEnd$.asObservable();
	}

	public ngOnInit(): void {
		this._updateActiveFieldProperty();
		this._updateModelProperty();
        this._updateFields();
        this._fieldDropListService.resetDropListIds(this.form.id);

        setTimeout(() => {
            this.formModel = cloneDeep(this.form.model);
        });

		this.editorService.formChanged$
			.pipe(takeUntil(this._destroy$))
			.subscribe(formId => {
                if (formId !== this.form.id) {
                    return;
                }

                this._updateFields();
                this._fieldDropListService.resetDropListIds(formId);
                this._formChanged$.next();
            });

		this.editorService.fieldSelected$
			.pipe(takeUntil(this._destroy$))
			.subscribe(field => {
                if (field.formId !== this.form.id) {
                    return;
                }

                this._updateActiveFieldProperty();
            });
	}

	public ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

	onActiveFieldChanged(): void {
        this._updateFields();
		this._formChanged$.next();
	}

    onModelPropertyChanged(): void {
        this.formModel = cloneDeep(this.form.model);
    }

    onModelChanged(model: Record<string, unknown>): void {
        this.form.model = cloneDeep(model);
		this._updateModelProperty();
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
                    this.formModel = cloneDeep(this.form.model);
                    this._updateModelProperty();
                    this._formChanged$.next();
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
        this.onModelChanged(this.formModel);
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

	private _updateActiveFieldProperty(): void {
		this.activeFieldProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this._initRootProperty(this.activeFieldProperty);
		this.activeFieldProperty.childProperties = cloneDeep(this.form.activeField.properties);
		this.activeFieldProperty.populateChildrenFromTarget = false;
		this.activeFieldProperty.addOptions = [];
	}

	private _updateModelProperty(): void {
		this.modelProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this._initRootProperty(this.modelProperty);
	}

    private _updateFields(): void {
        this.fields = cloneDeep(this.form.fields);
		this.formGroup = new FormGroup({});
		this.options = {};

        const fieldsClone: IEditorFormlyField[] = cloneDeep(this.form.fields);
        fieldsClone.forEach(field => this.editorService.cleanField(field, true, true));
        this.fieldsJSON = JSON.stringify(fieldsClone, null, 2);
    }

	private _initRootProperty(property: IArrayProperty | IObjectProperty) {
		property.name = 'root';
		property.key = undefined;
		property.isRemovable = false;
		property.isKeyEditable = false;
	}
}
