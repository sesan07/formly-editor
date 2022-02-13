import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ImportJSONRequest, ImportJSONResponse } from './import-json-dialog.types';

@Component({
    selector: 'lib-import-form-dialog',
    templateUrl: './import-form-dialog.component.html',
    styleUrls: ['./import-form-dialog.component.scss']
})
export class ImportFormDialogComponent {

    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

    @ViewChild('nameModel') nameModel: NgModel;
    @ViewChild('fileNameModel') fileNameModel: NgModel;
    @ViewChild('jsonModel') jsonModel: NgModel;

    @ViewChild('fileSelect') fileSelectElement: ElementRef<HTMLInputElement>;

    nameValue: string;
    fileNameValue: string;
    jsonValue: string;

    currTabIndex = 0;

    get isFormValid(): boolean {
        if (!this.fileNameModel || !this.jsonModel) {
            return false;
        }

        if (this.data.showName) {
            return this.currTabIndex === 0
                ? this.nameModel.valid && this.fileNameModel.valid
                : this.currTabIndex === 1
                    ? this.nameModel.valid && this.jsonModel.valid
                    : true;
        }

        return this.currTabIndex === 0
            ? this.fileNameModel.valid
            : this.currTabIndex === 1
                ? this.jsonModel.valid
                : true;
    }

    private _selectedFile: File;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ImportJSONRequest,
        private _dialogRef: MatDialogRef<ImportFormDialogComponent, ImportJSONResponse>
    ) { }

    onFileChanged(): void {
        const file: File = this.fileSelectElement?.nativeElement.files.item(0);
        if (file) {
            this._selectedFile = file;
            this.fileNameValue = file.name.split('/').shift();
        }
    }

    onImport(): void {
        if (this.currTabIndex === 0) {
            this._dialogRef.close({
                name: this.nameValue,
                file: this._selectedFile
            });
        } else if (this.currTabIndex === 1) {
            this._dialogRef.close({
                name: this.nameValue,
                json: this.jsonValue
            });
        }
    }

}
