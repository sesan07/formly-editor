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

import { AddFormDialogComponent } from './add-form-dialog/add-form-dialog.component';
import { ExportFormDialogComponent } from './export-form-dialog/export-form-dialog.component';
import { FieldCategoryComponent } from './field-category/field-category.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FormComponent } from './form.component';
import { ImportFormDialogComponent } from './import-form-dialog/import-form-dialog.component';
import { PropertyModule } from '../property/property.module';
import { CustomFormlyModule } from '../custom-formly/custom-formly.module';
import { FieldTreeItemComponent } from './field-tree-item/field-tree-item.component';
import { TreeModule } from '../tree/tree.module';
import { SidebarModule } from '../sidebar/sidebar.module';
import { JsonFileValidatorDirective } from './json-file-validator/json-file-validator.directive';
import { JsonValidatorDirective } from './json-validator/json-validator.directive';
import { BreakpointComponent } from './edit-field/edit-field-styles/breakpoint/breakpoint.component';
import { ContainerOptionComponent } from './edit-field/edit-field-styles/container-option/container-option.component';
import { EditFieldStylesComponent } from './edit-field/edit-field-styles/edit-field-styles.component';
import { EditFieldComponent } from './edit-field/edit-field.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
    declarations: [
        AddFormDialogComponent,
        ImportFormDialogComponent,
        ExportFormDialogComponent,
        ToolbarComponent,
        FieldTreeItemComponent,
        FieldCategoryComponent,
        BreakpointComponent,
        ContainerOptionComponent,
        EditFieldStylesComponent,
        EditFieldComponent,
        JsonValidatorDirective,
        JsonFileValidatorDirective,
        FormComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        CustomFormlyModule,
        TreeModule,
        PropertyModule,
        SidebarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatInputModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatTabsModule,
        DragDropModule,
        MatSelectModule,
        MatTooltipModule,
    ],
    exports: [
        FormComponent,
    ]
})
export class FormModule { }
