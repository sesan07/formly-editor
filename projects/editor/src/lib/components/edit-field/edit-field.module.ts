import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { EditFieldDialogComponent } from './edit-field-dialog/edit-field-dialog.component';
import { EditFieldStylesComponent } from './edit-field-styles/edit-field-styles.component';
import { EditFieldComponent } from './edit-field.component';
import { CustomFormlyModule } from '../custom-formly/custom-formly.module';
import { BreakpointComponent } from './edit-field-styles/breakpoint/breakpoint.component';
import { ContainerOptionComponent } from './edit-field-styles/container-option/container-option.component';
import { PropertyModule } from '../property/property.module';

@NgModule({
    declarations: [
        BreakpointComponent,
        ContainerOptionComponent,
        EditFieldDialogComponent,
        EditFieldStylesComponent,
        EditFieldComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        CustomFormlyModule,
        PropertyModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatTooltipModule,
        MatTabsModule,
    ],
    exports: [
        EditFieldDialogComponent,
        EditFieldComponent,
    ]
})
export class EditFieldModule { }
