import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

import { ImportJSONData, ImportJSONValue } from './json-dialog.types';
import { FileService } from '../shared/services/file-service/file.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { JSONValidatorDirective } from './json-validator/json-validator.directive';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    templateUrl: './json-dialog.component.html',
    styleUrls: ['./json-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        TextEditorComponent,
        JSONValidatorDirective,
        MatButton,
        MatIcon,
        MatDialogActions,
        MatDialogClose,
    ],
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
