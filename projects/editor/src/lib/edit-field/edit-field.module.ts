import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { StylesComponent } from './styles/styles.component';
import { EditFieldComponent } from './edit-field.component';
import { CustomFormlyModule } from '../custom-formly/custom-formly.module';
import { PropertyModule } from '../property/property.module';
import { StyleOptionComponent } from './styles/style-option/style-option.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
    declarations: [StylesComponent, EditFieldComponent, StyleOptionComponent],
    imports: [
        CommonModule,
        FormsModule,
        CustomFormlyModule,
        PropertyModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatTabsModule,
        MatExpansionModule,
        MatButtonToggleModule,
    ],
    exports: [EditFieldComponent],
})
export class EditFieldModule {}
