import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { IEditorFormlyField, IForm } from '../editor.types';
import { FileService } from '../shared/services/file-service/file.service';
import { cleanField } from '../form/utils';
import { AddFormDialogComponent } from '../form/add-form-dialog/add-form-dialog.component';
import { AddFormResponse } from '../form/add-form-dialog/add-json-dialog.types';
import { ExportFormDialogComponent } from '../form/export-form-dialog/export-form-dialog.component';
import { ExportJSONRequest, ExportJSONResponse } from '../form/export-form-dialog/export-json-dialog.types';

@Component({
    selector: 'editor-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
    public forms$: Observable<IForm[]>;
    public activeFormIndex$: Observable<number>;

    private _destroy$: Subject<void> = new Subject();
    private _activeForm: IForm;

    constructor(private _editorService: EditorService, private _dialog: MatDialog, private _fileService: FileService) {}

    ngOnInit(): void {
        this.forms$ = this._editorService.forms$;
        this.activeFormIndex$ = this._editorService.activeFormIndex$.pipe(
            takeUntil(this._destroy$),
            tap(i => (this._activeForm = this._editorService.getForm(i)))
        );
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onImportForm(): void {
        const dialogRef: MatDialogRef<AddFormDialogComponent, AddFormResponse> =
            this._dialog.open(AddFormDialogComponent);

        dialogRef.afterClosed().subscribe(res => {
            if (res?.json) {
                this._editorService.importForm(res.name, res.json);
            } else if (res) {
                this._editorService.addForm(res.name);
            }
        });
    }

    onExportForm(): void {
        const fieldsClone: IEditorFormlyField[] = cloneDeep(this._activeForm.fields);
        fieldsClone.forEach(field => cleanField(field, true, true));

        const config: MatDialogConfig<ExportJSONRequest> = {
            data: {
                type: 'Form',
                name: this._activeForm.name + '.json',
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
