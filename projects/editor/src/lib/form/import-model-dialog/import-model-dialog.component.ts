import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgForm, NgModel, NgModelGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImportModelResponse } from './import-model-dialog.types';
import { FileService } from '../../shared/services/file-service/file.service';
import { JsonValidatorDirective } from '../json-validator/json-validator.directive';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
    selector: 'editor-import-form-dialog',
    templateUrl: './import-model-dialog.component.html',
    styleUrls: ['./import-model-dialog.component.scss'],
})
export class ImportModelDialogComponent {
    @ViewChild('form', { read: NgForm })
    form: NgForm;

    @ViewChild('fileSelect', { read: ElementRef })
    fileSelectElement: ElementRef<HTMLInputElement>;
    @ViewChild('jsonModel', { read: NgModel })
    jsonModel: NgModel;

    currTabIndex = 0;

    constructor(
        private _dialogRef: MatDialogRef<ImportModelDialogComponent, ImportModelResponse>,
        private _fileService: FileService
    ) {}

    get isFormValid(): boolean {
        if (!this.form) {
            return true;
        }

        return this.form.valid;
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
        if (!this.isFormValid) {
            return;
        }

        this._dialogRef.close({
            json: this.form.value.json,
        });
    }
}
