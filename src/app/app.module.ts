import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { EditorModule } from '@sesan07/ngx-formly-editor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckboxService } from './services/field-services/checkbox/checkbox.service';
import { AppFieldType } from './services/field-services/field.types';
import { FormlyGroupService } from './services/field-services/formly-group/formly-group.service';
import { InputService } from './services/field-services/input/input.service';
import { RadioService } from './services/field-services/radio/radio.service';
import { SelectService } from './services/field-services/select/select.service';
import { TextareaService } from './services/field-services/textarea/textarea.service';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        FormlyMaterialModule,
        EditorModule.forRoot({
            options: [
                {
                    displayName: 'Input',
                    children: [
                        {
                            displayName: 'Input',
                            type: AppFieldType.INPUT,
                            keyGenerationPrefix: 'inp',
                            service: InputService,
                        },
                        {
                            displayName: 'Number',
                            type: AppFieldType.NUMBER,
                            keyGenerationPrefix: 'num',
                            service: InputService,
                        },
                    ],
                },
                {
                    displayName: 'Checkbox',
                    type: AppFieldType.CHECKBOX,
                    keyGenerationPrefix: 'chk',
                    service: CheckboxService,
                },
                {
                    displayName: 'Radio',
                    type: AppFieldType.RADIO,
                    keyGenerationPrefix: 'rad',
                    service: RadioService,
                },
                {
                    displayName: 'Select',
                    type: AppFieldType.SELECT,
                    keyGenerationPrefix: 'sel',
                    service: SelectService,
                },
                {
                    displayName: 'Textarea',
                    type: AppFieldType.TEXTAREA,
                    keyGenerationPrefix: 'txt',
                    service: TextareaService,
                },
                {
                    displayName: 'Group',
                    type: AppFieldType.FORMLY_GROUP,
                    disableKeyGeneration: true,
                    childrenConfig: {
                        path: 'fieldGroup',
                    },
                    service: FormlyGroupService,
                },
            ],
        }),
        FormlyModule.forRoot({
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        StoreModule.forRoot({}),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
