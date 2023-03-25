import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImportJSONData, ImportJSONValue } from './json-dialog.types';
import { FileService } from '../shared/services/file-service/file.service';

@Component({
    templateUrl: './json-dialog.component.html',
    styleUrls: ['./json-dialog.component.scss'],
})
export class JSONDialogComponent implements AfterViewInit {
    @ViewChild('form', { read: NgForm })
    form: NgForm;

    @ViewChild('fileSelect', { read: ElementRef })
    fileSelectElement: ElementRef<HTMLInputElement>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ImportJSONData,
        private _dialogRef: MatDialogRef<JSONDialogComponent, ImportJSONValue>,
        private _fileService: FileService
    ) {}

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.form.controls.json.setValue(this.data.defaultValue?.json);
            if (this.data.name) {
                this.form.controls.name.setValue(this.data.defaultValue?.name);
            }
        });
    }

    onFileChanged(): void {
        const file: File = this.fileSelectElement.nativeElement.files.item(0);
        this._fileService.readFile(file).subscribe(text => {
            const jsonControl = this.form.controls.json;
            jsonControl.setValue(text);
            jsonControl.markAsTouched();
        });
    }

    onImport(): void {
        this._dialogRef.close(this.form.value);
    }
}
