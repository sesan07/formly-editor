import { CdkScrollable } from '@angular/cdk/scrolling';

import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

import { readFile } from '../file/file.utils';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { ImportJSONData, ImportJSONValue } from './json-dialog.types';
import { JSONValidatorDirective } from './json-validator/json-validator.directive';

@Component({
    templateUrl: './json-dialog.component.html',
    styleUrls: ['./json-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        ReactiveFormsModule,
        FormsModule,
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
        private _dialogRef: MatDialogRef<JSONDialogComponent, ImportJSONValue>
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
        readFile(file).subscribe(text => {
            const jsonControl = this.form.controls.json;
            jsonControl.setValue(text);
            jsonControl.markAsTouched();
        });
    }

    onImport(): void {
        this._dialogRef.close(this.form.value);
    }
}
