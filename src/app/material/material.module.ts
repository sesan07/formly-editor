import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { EditorModule } from '@sesan07/ngx-formly-editor';

import { AppFieldType } from '../services/field-services/field.types';
import { MaterialRoutingModule } from './material-routing.module';
import { MaterialComponent } from './material.component';

@NgModule({
    declarations: [MaterialComponent],
    imports: [
        CommonModule,
        MaterialRoutingModule,
        EditorModule,
        FormlyMaterialModule,
        FormlyModule.forRoot({
            types: [
                { name: AppFieldType.INPUT, defaultOptions: { props: { appearance: 'fill' } } },
                { name: AppFieldType.RADIO, defaultOptions: { props: { appearance: 'fill' } } },
                { name: AppFieldType.SELECT, defaultOptions: { props: { appearance: 'fill' } } },
                { name: AppFieldType.TEXTAREA, defaultOptions: { props: { appearance: 'fill' } } },
            ],
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
    ],
})
export class MaterialModule {}
