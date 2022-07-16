import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ExportJSONRequest, ExportJSONResponse } from './export-json-dialog.types';

@Component({
    selector: 'editor-export-form-dialog',
    templateUrl: './export-form-dialog.component.html',
    styleUrls: ['./export-form-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportFormDialogComponent implements OnInit {

    nameValue: string;
    jsonValue: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ExportJSONRequest,
        private _dialogRef: MatDialogRef<ExportFormDialogComponent, ExportJSONResponse>
    ) { }

    ngOnInit(): void {
        this.nameValue = this.data.name;
        this.jsonValue = this.data.json;
    }

    onExport(): void {
        this._dialogRef.close({
            name: this.nameValue,
            json: this.jsonValue
        });
    }

}
