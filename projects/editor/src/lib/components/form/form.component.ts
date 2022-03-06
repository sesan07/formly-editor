import { Component, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { EditorService } from '../../services/editor-service/editor.service';
import { IForm } from '../../services/editor-service/editor.types';
import { cloneDeep } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { IObjectProperty } from '../property/object-property/object-property.types';
import { PropertyType } from '../property/property.types';
import { PropertyService } from '../property/property.service';
import { IArrayProperty } from '../property/array-property/array-property.types';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';
import { ImportFormDialogComponent } from '../import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from '../import-form-dialog/import-json-dialog.types';
import { ExportFormDialogComponent } from '../export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from '../export-form-dialog/export-json-dialog.types';
import { FileService } from '../../services/file-service/file.service';

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

	private _formChanged$: Subject<void> = new Subject();
	private _destroy$: Subject<void> = new Subject();

	private _prevResizeX: number;
	private _totalResizeDeltaX: number;
	private _sidebarStartWidth: number;
	private _stopMouseMoveListener: () => void;
	private _stopMouseUpListener: () => void;

	constructor(
		public propertyService: PropertyService,
		public editorService: EditorService,
        private _dialog: MatDialog,
		private _renderer: Renderer2,
        private _fileService: FileService,
        private _fieldDropListService: FieldDroplistService) {
	}

	public ngOnInit(): void {
		this._updateActiveFieldProperty();
		this._updateModelProperty();
        this._fieldDropListService.resetDropListIds(this.form.id);

		this.editorService.formChanged$
			.pipe(takeUntil(this._destroy$))
			.subscribe(formId => {
                if (formId === this.form.id) {
                    this._fieldDropListService.resetDropListIds(formId);
                    this._formChanged$.next();
                }
            });

		this.editorService.fieldSelected$
			.pipe(takeUntil(this._destroy$))
			.subscribe(() => this._updateActiveFieldProperty());
	}

	public ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

	onFieldPropertyChanged(): void {
		this._formChanged$.next();
	}

    onModelChanged(): void {
		this._updateModelProperty();
    }

    onModelPropertyChanged(): void {
        this._formChanged$.next();
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

	onSidebarMouseDown(event: MouseEvent, sidebarId: string, isReverse: boolean): void {
		this._prevResizeX = event.clientX;
		this._totalResizeDeltaX = 0;

		const sidebar: HTMLElement = document.getElementById(sidebarId);
		this._sidebarStartWidth = sidebar.clientWidth;

		this._stopMouseMoveListener = this._renderer.listen('window', 'mousemove', (e: MouseEvent) => {
			this._resizeSidebar(sidebarId, e.clientX, isReverse);
			e.preventDefault();
		});
		this._stopMouseUpListener = this._renderer.listen('window', 'mouseup', () => {
			this._stopMouseMoveListener();
			this._stopMouseUpListener();
		});
	}

	private _updateActiveFieldProperty(): void {
		this.activeFieldProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this._initRootProperty(this.activeFieldProperty);
		this.activeFieldProperty.childProperties = this.form.activeField.properties;
		this.activeFieldProperty.populateChildrenFromTarget = false;
		this.activeFieldProperty.addOptions = [];
	}

	private _updateModelProperty(): void {
		this.modelProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
		this._initRootProperty(this.modelProperty);

	}

	private _initRootProperty(property: IArrayProperty | IObjectProperty) {
		property.name = 'root';
		property.key = undefined;
		property.isDeletable = false;
		property.isKeyEditable = false;
	}

	private _resizeSidebar(sidebarId: string, newPositionX: number, isReverse: boolean): void {
		const resizeXDelta: number = newPositionX - this._prevResizeX;
		this._totalResizeDeltaX += isReverse ? -resizeXDelta : resizeXDelta;
		const targetWidth: number = this._sidebarStartWidth - this._totalResizeDeltaX;

		const sidebar: HTMLElement = document.getElementById(sidebarId);
		this._renderer.setStyle(sidebar, 'width', targetWidth + 'px');

		this._prevResizeX = newPositionX;
	}
}
