import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { EditorService } from '../../services/editor-service/editor.service';
import { IEditorFormlyField, IForm } from '../../services/editor-service/editor.types';
import { cloneDeep } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { IObjectProperty } from '../property/object-property/object-property.types';
import { IPropertyValueChange, PropertyType } from '../property/property.types';
import { PropertyService } from '../property/property.service';
import { IArrayProperty } from '../property/array-property/array-property.types';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { ImportFormDialogComponent } from '../import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from '../import-form-dialog/import-json-dialog.types';
import { ExportFormDialogComponent } from '../export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from '../export-form-dialog/export-json-dialog.types';
import { FileService } from '../../services/file-service/file.service';
import { SideBarPosition } from '../sidebar/sidebar.types';
import { changePropertyTarget } from '../property/property.utils';

@Component({
	selector: 'lib-form',
	templateUrl: './form.component.html',
	styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
	@Input() form: IForm;

	public activeFieldProperty: IObjectProperty;
	public modelProperty: IObjectProperty;
	public get formChanged$(): Observable<void> {
		return this._formChanged$.asObservable();
	}

	public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public isAdvanced: boolean;
    public showSidebars = true;

    public jsonFields: string;
    public selectedFormDisplay: 'form' | 'json' = 'form';
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

	public ngOnInit(): void {
		this._updateActiveFieldProperty();
		this._updateModelProperty();
        this._updateJSONFields();
        this._fieldDropListService.resetDropListIds(this.form.id);

		this.editorService.formChanged$
			.pipe(takeUntil(this._destroy$))
			.subscribe(formId => {
                if (formId !== this.form.id) {
                    return;
                }

                this._updateJSONFields();
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

	onFieldPropertyChanged(change: IPropertyValueChange): void {
        changePropertyTarget(change, this.form.activeField);
        this._updateJSONFields();
		this._formChanged$.next();
	}

    onModelPropertyChanged(change: IPropertyValueChange): void {
        changePropertyTarget(change, this.form.model);
        this._formChanged$.next();
    }

    onModelChanged(): void {
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
        this._resetModel$.next();
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

    private _updateJSONFields(): void {
        const fieldsClone: IEditorFormlyField[] = cloneDeep(this.form.fields);
        fieldsClone.forEach(field => this.editorService.cleanField(field, true, true));
        this.jsonFields = JSON.stringify(fieldsClone, null, 2);
    }

	private _initRootProperty(property: IArrayProperty | IObjectProperty) {
		property.name = 'root';
		property.key = undefined;
		property.isDeletable = false;
		property.isKeyEditable = false;
	}
}
