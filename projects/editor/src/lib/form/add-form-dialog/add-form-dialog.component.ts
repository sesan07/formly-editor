import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AddFormResponse } from './add-json-dialog.types';
import { FileService } from '../../shared/services/file-service/file.service';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
    selector: 'editor-import-form-dialog',
    templateUrl: './add-form-dialog.component.html',
    styleUrls: ['./add-form-dialog.component.scss'],
})
export class AddFormDialogComponent implements AfterViewInit {
    @ViewChild(MatTabGroup)
    tabGroup: MatTabGroup;

    @ViewChild('newGroup', { read: NgModelGroup })
    newGroup: NgModelGroup;
    @ViewChild('importGroup', { read: NgModelGroup })
    importGroup: NgModelGroup;

    @ViewChild('nameModel', { read: ElementRef })
    nameElement: ElementRef<HTMLInputElement>;
    @ViewChild('fileSelect', { read: ElementRef })
    fileSelectElement: ElementRef<HTMLInputElement>;

    formName: string;

    currTabIndex = 0;

    constructor(
        private _dialogRef: MatDialogRef<AddFormDialogComponent, AddFormResponse>,
        private _fileService: FileService
    ) {}

    get isFormValid(): boolean {
        if (!this.importGroup || !this.newGroup) {
            return false;
        }

        return this.currTabIndex === 0 ? this.newGroup.valid : this.currTabIndex === 1 ? this.importGroup.valid : false;
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.nameElement.nativeElement.focus());
    }

    onFileChanged(): void {
        const file: File = this.fileSelectElement.nativeElement.files.item(0);
        this._fileService.readFile(file).subscribe(text => {
            const jsonControl = this.importGroup.control.controls.json;
            jsonControl.setValue(text);
            jsonControl.markAsTouched();
        });
    }

    onAdd(): void {
        if (!this.isFormValid) {
            return;
        }

        if (this.currTabIndex === 0) {
            this._dialogRef.close({
                name: this.newGroup.value.formName,
            });
        } else if (this.currTabIndex === 1) {
            this._dialogRef.close({
                name: this.importGroup.value.formName,
                json: this.importGroup.value.json,
            });
        }
    }
}
