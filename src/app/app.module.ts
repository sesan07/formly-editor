import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { EditorModule } from '@sesan07/ngx-formly-editor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TypesModule } from './components/types/types.module';
import { CardWrapperComponent } from './components/wrappers/card-wrapper/card-wrapper.component';
import { CheckboxService } from './services/field-services/checkbox/checkbox.service';
import { AppFieldType, AppWrapperType } from './services/field-services/field.types';
import { FormlyGroupService } from './services/field-services/formly-group/formly-group.service';
import { InputService } from './services/field-services/input/input.service';
import { RadioService } from './services/field-services/radio/radio.service';
import { RepeatingSectionService } from './services/field-services/repeating-section/repeating-section.service';
import { SelectService } from './services/field-services/select/select.service';
import { TextareaService } from './services/field-services/textarea/textarea.service';

@NgModule({
    declarations: [AppComponent, CardWrapperComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        MatCardModule,
        MatButtonModule,
        FormlyMaterialModule,
        TypesModule,
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
                    children: [
                        {
                            displayName: 'Group',
                            type: AppFieldType.FORMLY_GROUP,
                            disableKeyGeneration: true,
                            childrenConfig: {
                                path: 'fieldGroup',
                            },
                            service: FormlyGroupService,
                        },
                        {
                            displayName: 'Card - Custom',
                            type: AppFieldType.FORMLY_GROUP_CARD,
                            disableKeyGeneration: true,
                            childrenConfig: {
                                path: 'fieldGroup',
                            },
                            service: FormlyGroupService,
                        },
                    ],
                },
                {
                    displayName: 'Repeating Section',
                    type: AppFieldType.REPEATING_SECTION,
                    keyGenerationPrefix: 'rep',
                    childrenConfig: {
                        path: 'fieldArray',
                        isObject: true,
                    },
                    service: RepeatingSectionService,
                },
            ],
        }),
        FormlyModule.forRoot({
            types: [
                { name: 'input', defaultOptions: { props: { appearance: 'fill' } } },
                { name: 'radio', defaultOptions: { props: { appearance: 'fill' } } },
                { name: 'select', defaultOptions: { props: { appearance: 'fill' } } },
                { name: 'textarea', defaultOptions: { props: { appearance: 'fill' } } },
            ],
            wrappers: [{ name: AppWrapperType.CARD, component: CardWrapperComponent }],
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        StoreModule.forRoot({}),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
