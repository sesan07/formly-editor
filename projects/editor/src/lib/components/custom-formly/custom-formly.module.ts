import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';

import { FormlyModule } from '@ngx-formly/core';

import { FieldType } from '../../services/editor-service/editor.types';
import { FormlyGroupComponent } from './formly-group/formly-group.component';
import { FormlyFieldComponent, RootFormlyFieldComponent } from './formly-field/formly-field.component';
import { FormlyFormComponent } from './formly-form/formly-form.component';
import { PropertyModule } from '../property/property.module';

@NgModule({
    declarations: [
        FormlyGroupComponent,
        FormlyFieldComponent,
        RootFormlyFieldComponent,
        FormlyFormComponent,
    ],
    imports: [
        CommonModule,
        FormlyModule.forRoot({
            types: [{ name: FieldType.FORMLY_GROUP, component: FormlyGroupComponent }],
        }),
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        DragDropModule,
        PropertyModule,
    ],
    exports: [
        FormlyFormComponent,
        FormlyModule,
    ]
})
export class CustomFormlyModule { }
