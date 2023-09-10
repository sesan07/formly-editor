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
import { EditorModule, EDITOR_FIELD_SERVICE, FormlyGroupComponent } from 'editor';
import { RepeatingSectionTypeComponent } from './components/types/repeating-section-type/repeating-section-type.component';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { TypesModule } from './components/types/types.module';
import { FormlyModule } from '@ngx-formly/core';

@NgModule({
    declarations: [AppComponent, CardWrapperComponent, RepeatingSectionTypeComponent],
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
                        },
                        {
                            displayName: 'Number',
                            type: AppFieldType.NUMBER,
                        },
                    ],
                },
                {
                    displayName: 'Checkbox',
                    type: AppFieldType.CHECKBOX,
                },
                {
                    displayName: 'Radio',
                    type: AppFieldType.RADIO,
                },
                {
                    displayName: 'Select',
                    type: AppFieldType.SELECT,
                },
                {
                    displayName: 'Textarea',
                    type: AppFieldType.TEXTAREA,
                },
                {
                    displayName: 'Group',
                    children: [
                        {
                            type: AppFieldType.FORMLY_GROUP,
                            displayName: 'Group',
                            canHaveChildren: true,
                            childrenPath: 'fieldGroup',
                        },
                        {
                            type: AppFieldType.FORMLY_GROUP_CARD,
                            displayName: 'Card - Custom',
                            canHaveChildren: true,
                            childrenPath: 'fieldGroup',
                        },
                        // {
                        //     name: FieldType.REPEATING_SECTION,
                        //     displayName: 'Repeating Section',
                        //     canHaveChildren: true,
                        //     childrenPath: 'fieldArray.fieldGroup',
                        //     component: RepeatingSectionTypeComponent
                        // },
                    ],
                },
                {
                    type: AppFieldType.OTHER,
                    displayName: 'Generic',
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
