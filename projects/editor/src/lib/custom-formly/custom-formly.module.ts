import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FormlyModule } from '@ngx-formly/core';
import { DndModule } from '@ng-dnd/core';

import { FormlyGroupComponent } from './formly-group/formly-group.component';
import { FormlyFieldComponent, RootFormlyFieldComponent } from './formly-field/formly-field.component';
import { FormlyFormComponent } from './formly-form/formly-form.component';
import { PropertyModule } from '../property/property.module';
import { FieldNameModule } from '../field-name/field-name.module';
import { FieldDropOverlayModule } from '../field-drag-drop/field-drop-overlay/field-drop-overlay.module';

@NgModule({
    declarations: [FormlyGroupComponent, FormlyFieldComponent, RootFormlyFieldComponent, FormlyFormComponent],
    imports: [
        CommonModule,
        FormlyModule,
        DndModule,
        FieldNameModule,
        FieldDropOverlayModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        PropertyModule,
    ],
    exports: [FormlyFormComponent],
})
export class CustomFormlyModule {}
