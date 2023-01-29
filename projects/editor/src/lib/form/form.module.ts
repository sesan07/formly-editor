import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ExportFormDialogComponent } from './export-form-dialog/export-form-dialog.component';
import { FieldCategoryComponent } from './field-category/field-category.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FormComponent } from './form.component';
import { AddFormDialogComponent } from './add-form-dialog/add-form-dialog.component';
import { PropertyModule } from '../property/property.module';
import { CustomFormlyModule } from '../custom-formly/custom-formly.module';
import { FieldTreeItemComponent } from './field-tree-item/field-tree-item.component';
import { TreeItemModule } from '../tree-item/tree-item.module';
import { SidebarModule } from '../sidebar/sidebar.module';
import { JsonFileValidatorDirective } from './json-file-validator/json-file-validator.directive';
import { JsonValidatorDirective } from './json-validator/json-validator.directive';
import { EditFieldModule } from '../edit-field/edit-field.module';
import { FieldNameModule } from '../field-name/field-name.module';
import { ImportModelDialogComponent } from './import-model-dialog/import-model-dialog.component';
import { TextEditorModule } from '../text-editor/text-editor.module';

@NgModule({
    declarations: [
        AddFormDialogComponent,
        ImportModelDialogComponent,
        ExportFormDialogComponent,
        ToolbarComponent,
        FieldTreeItemComponent,
        FieldCategoryComponent,
        JsonValidatorDirective,
        JsonFileValidatorDirective,
        FormComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        CustomFormlyModule,
        EditFieldModule,
        TreeItemModule,
        PropertyModule,
        SidebarModule,
        FieldNameModule,
        TextEditorModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatInputModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatTabsModule,
        DragDropModule,
    ],
    exports: [FormComponent],
})
export class FormModule {}
