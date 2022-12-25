import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { AddFormResponse } from './add-form-dialog.types';

@Component({
    selector: 'editor-add-form-dialog',
    templateUrl: './add-form-dialog.component.html',
    styleUrls: ['./add-form-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFormDialogComponent implements AfterViewInit {
    @ViewChild('nameModel', { read: NgModel })
    nameModel: NgModel;
    @ViewChild('nameModel', { read: ElementRef })
    nameElement: ElementRef<HTMLInputElement>;

    constructor(private _dialogRef: MatDialogRef<AddFormDialogComponent, AddFormResponse>) {}

    ngAfterViewInit(): void {
        setTimeout(() => this.nameElement.nativeElement.focus());
    }

    onAdd(): void {
        if (this.nameModel.valid) {
            this._dialogRef.close({
                name: this.nameModel.value,
            });
        }
    }
}
