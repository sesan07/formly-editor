import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';

import { EditorModule } from '@sesan07/ngx-formly-editor';

import { BootstrapRoutingModule } from './bootstrap-routing.module';
import { BootstrapComponent } from './bootstrap.component';
import { bootstrapEditorConfig } from './bootstrap-editor.config';

@NgModule({
    imports: [
        CommonModule,
        BootstrapRoutingModule,
        FormlyBootstrapModule,
        FormlyModule.forRoot({
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        EditorModule.forRoot(bootstrapEditorConfig),
        BootstrapComponent,
    ],
})
export class BootstrapModule {}
