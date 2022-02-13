import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { EditorService } from '../../services/editor-service/editor.service';
import { FileService } from '../../services/file-service/file.service';
import { MouseService } from '../../services/mouse-service/mouse.service';
import { ImportFormDialogComponent } from '../import-form-dialog/import-form-dialog.component';
import { ImportJSONRequest, ImportJSONResponse } from '../import-form-dialog/import-json-dialog.types';

@Component({
    selector: 'lib-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent {

    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

    constructor(
        public editorService: EditorService,
        private _mouseService: MouseService,
        private _dialog: MatDialog,
        private _fileService: FileService
    ) { }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this._mouseService.position.x = event.clientX;
        this._mouseService.position.y = event.clientY;
    }

    onImportForm(): void {
        const config: MatDialogConfig<ImportJSONRequest> = {
            data: {
                type: 'Form',
                showName: true
            }
        };

        const dialogRef: MatDialogRef<ImportFormDialogComponent, ImportJSONResponse> = this._dialog.open(ImportFormDialogComponent, config);

        dialogRef.afterClosed()
            .pipe(mergeMap(res => {
                // If user selected a file, read file content and set the json property
                if (res.file) {
                    return this._fileService.readFile(res.file)
                        .pipe(map(text => ({
                            name: res.name,
                            json: text
                        })));
                }
                return of(res);
            }))
            .subscribe(res => {
                if (res) {
                    this.editorService.importForm(res.name, res.json);
                }
            });
    }

    onExportForm(): void {
        this.editorService.exportForm(this.tabGroup.selectedIndex);
    }

}
