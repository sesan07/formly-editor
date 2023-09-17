import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FieldService } from './services/field-services/field-service';
import { AppFieldType, AppWrapperType } from './services/field-services/field.types';
import { CardWrapperComponent } from './components/wrappers/card-wrapper/card-wrapper.component';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { HttpClientModule } from '@angular/common/http';
import { EditorModule, EDITOR_FIELD_SERVICE, FormlyGroupComponent } from '@sesan07/ngx-formly-editor';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { TypesModule } from './components/types/types.module';
import { FormlyModule } from '@ngx-formly/core';

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
            defaultType: AppFieldType.FORMLY_GROUP,
            defaultUnknownType: AppFieldType.OTHER,
            options: [
                {
                    displayName: 'Input',
                    children: [
                        {
                            displayName: 'Input',
                            type: AppFieldType.INPUT,
                            keyGenerationPrefix: 'inp',
                        },
                        {
                            displayName: 'Number',
                            type: AppFieldType.NUMBER,
                            keyGenerationPrefix: 'num',
                        },
                    ],
                },
                {
                    displayName: 'Checkbox',
                    type: AppFieldType.CHECKBOX,
                    keyGenerationPrefix: 'chk',
                },
                {
                    displayName: 'Radio',
                    type: AppFieldType.RADIO,
                    keyGenerationPrefix: 'rad',
                },
                {
                    displayName: 'Select',
                    type: AppFieldType.SELECT,
                    keyGenerationPrefix: 'sel',
                },
                {
                    displayName: 'Textarea',
                    type: AppFieldType.TEXTAREA,
                    keyGenerationPrefix: 'txt',
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
                        },
                        {
                            displayName: 'Card - Custom',
                            type: AppFieldType.FORMLY_GROUP_CARD,
                            disableKeyGeneration: true,
                            childrenConfig: {
                                path: 'fieldGroup',
                            },
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
                },
                {
                    displayName: 'Generic',
                    type: AppFieldType.OTHER,
                    disableKeyGeneration: true,
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
                // Default generic field
                {
                    name: AppFieldType.OTHER,
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
    providers: [{ provide: EDITOR_FIELD_SERVICE, useClass: FieldService }],
    bootstrap: [AppComponent],
})
export class AppModule {}
