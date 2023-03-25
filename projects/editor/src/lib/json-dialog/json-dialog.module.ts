import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { JSONDialogComponent } from './json-dialog.component';
import { JSONValidatorDirective } from './json-validator/json-validator.directive';
import { TextEditorModule } from '../text-editor/text-editor.module';

@NgModule({
    declarations: [JSONDialogComponent, JSONValidatorDirective],
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatDialogModule,
        TextEditorModule,
    ],
    exports: [JSONDialogComponent],
})
export class JSONDialogModule {}
