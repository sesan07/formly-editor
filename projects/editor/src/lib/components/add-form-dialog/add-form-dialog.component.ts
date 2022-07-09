import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AddFormResponse } from './add-form-dialog.types';

@Component({
  selector: 'editor-add-form-dialog',
  templateUrl: './add-form-dialog.component.html',
  styleUrls: ['./add-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddFormDialogComponent {

    nameValue: string;

    constructor(
        private _dialogRef: MatDialogRef<AddFormDialogComponent, AddFormResponse>
    ) { }

    onAdd(): void {
        this._dialogRef.close({
            name: this.nameValue
        });
    }
}
