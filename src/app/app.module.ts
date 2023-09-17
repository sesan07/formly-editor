import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppFieldType, AppWrapperType } from './services/field-services/field.types';
import { CardWrapperComponent } from './components/wrappers/card-wrapper/card-wrapper.component';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { HttpClientModule } from '@angular/common/http';
import { EditorModule, FormlyGroupComponent } from '@sesan07/ngx-formly-editor';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { TypesModule } from './components/types/types.module';
import { FormlyModule } from '@ngx-formly/core';
import { InputService } from './services/field-services/input/input.service';
import { CheckboxService } from './services/field-services/checkbox/checkbox.service';
import { RadioService } from './services/field-services/radio/radio.service';
import { SelectService } from './services/field-services/select/select.service';
import { TextareaService } from './services/field-services/textarea/textarea.service';
import { FormlyGroupService } from './services/field-services/formly-group/formly-group.service';
import { RepeatingSectionService } from './services/field-services/repeating-section/repeating-section.service';

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
                // Override default formly-group
                {
                    name: AppFieldType.FORMLY_GROUP,
                    component: FormlyGroupComponent,
                },
            ],
            wrappers: [{ name: AppWrapperType.CARD, component: CardWrapperComponent }],
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        StoreModule.forRoot(
            {},
            {
                metaReducers: [
                    (reducer: ActionReducer<any>): ActionReducer<any> =>
                        (state, action) => {
                            console.log('Action:', action.type);

                            return reducer(state, action);
                        },
                ],
            }
        ),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
