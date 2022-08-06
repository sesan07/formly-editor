import { Component, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { cloneDeep } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { IEditorFormlyField, IForm } from '../editor.types';
import { FileService } from '../shared/services/file-service/file.service';
import { cleanField } from '../form/utils';
import { AddFormDialogComponent } from '../form/add-form-dialog/add-form-dialog.component';
import { AddFormResponse } from '../form/add-form-dialog/add-form-dialog.types';
import { ExportFormDialogComponent } from '../form/export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from '../form/export-form-dialog/export-json-dialog.types';
import { ImportFormDialogComponent } from '../form/import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from '../form/import-form-dialog/import-json-dialog.types';

@Component({
    selector: 'editor-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    public tabIndex: number;
    public forms: IForm[] = [];

    private _destroy$: Subject<void> = new Subject();

    constructor(private _editorService: EditorService, private _dialog: MatDialog, private _fileService: FileService) {}

    ngOnInit(): void {
        this._editorService.forms$.pipe(takeUntil(this._destroy$)).subscribe(forms => (this.forms = forms));
        this._editorService.activeFormIndex$
            .pipe(takeUntil(this._destroy$))
            .subscribe(index => (this.tabIndex = index));
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddForm(): void {
        const config: MatDialogConfig = {
            height: 'auto',
            maxWidth: '600px',
        };

        const dialogRef: MatDialogRef<AddFormDialogComponent, AddFormResponse> = this._dialog.open(
            AddFormDialogComponent,
            config
        );

        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._editorService.addForm(res.name);
            }
        });
    }

    onImportForm(): void {
        const config: MatDialogConfig<ImportJSONRequest> = {
            data: {
                type: 'Form',
                showName: true,
            },
        };

        const dialogRef: MatDialogRef<ImportFormDialogComponent, ImportJSONResponse> = this._dialog.open(
            ImportFormDialogComponent,
            config
        );

        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._editorService.importForm(res.name, res.json);
            }
        });
    }

    onExportForm(): void {
        const form: IForm = this.forms[this.tabIndex];
        const fieldsClone: IEditorFormlyField[] = cloneDeep(form.fields);
        fieldsClone.forEach(field => cleanField(field, true, true));

        const config: MatDialogConfig<ExportJSONRequest> = {
            data: {
                type: 'Form',
                name: form.name + '.json',
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

    onRemoveForm(index: number): void {
        this._editorService.removeForm(index);
    }

    onTabChange(index: number): void {
        this._editorService.setActiveFormIndex(index);
    }

    onTabLabelMouseDown(event: MouseEvent, index: number): void {
        if (event.button === 1) {
            this.onRemoveForm(index);
        }
    }

    trackFormById: TrackByFunction<IForm> = (_, form: IForm) => form.id;
}
