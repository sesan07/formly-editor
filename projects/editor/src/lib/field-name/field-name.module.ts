import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldNamePipe } from './field-name.pipe';

@NgModule({
    declarations: [FieldNamePipe],
    imports: [CommonModule],
    exports: [FieldNamePipe],
})
export class FieldNameModule {}
