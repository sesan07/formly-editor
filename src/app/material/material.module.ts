import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { EditorModule } from '@sesan07/ngx-formly-editor';

import { CardWrapperModule } from './components/card-wrapper/card-wrapper.module';
import { RepeatingSectionTypeModule } from './components/repeating-section-type/repeating-section-type.module';
import { materialEditorConfig } from './material-editor.config';
import { MaterialRoutingModule } from './material-routing.module';
import { MaterialComponent } from './material.component';

@NgModule({
    declarations: [MaterialComponent],
    imports: [
        CommonModule,
        MaterialRoutingModule,
        RepeatingSectionTypeModule,
        CardWrapperModule,
        FormlyMaterialModule,
        FormlyModule.forRoot({
            types: [
                { name: 'input', defaultOptions: { props: { appearance: 'fill' } } },
                { name: 'radio', defaultOptions: { props: { appearance: 'fill' } } },
                { name: 'select', defaultOptions: { props: { appearance: 'fill' } } },
                { name: 'textarea', defaultOptions: { props: { appearance: 'fill' } } },
            ],
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        EditorModule.forRoot(materialEditorConfig),
    ],
})
export class MaterialModule {}
