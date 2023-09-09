import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FieldService } from './services/field-services/field-service';
import { AppCustomFieldType, AppFieldType, AppWrapperType } from './services/field-services/field.types';
import { CardWrapperComponent } from './components/wrappers/card-wrapper/card-wrapper.component';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { HttpClientModule } from '@angular/common/http';
import { EditorModule, EDITOR_FIELD_SERVICE } from 'editor';
import { RepeatingSectionTypeComponent } from './components/types/repeating-section-type/repeating-section-type.component';
import { ActionReducer, StoreModule } from '@ngrx/store';

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
        EditorModule.forRoot({
            defaultName: AppFieldType.FORMLY_GROUP,
            unknownTypeName: AppFieldType.OTHER,
            typeCategories: [
                {
                    name: 'Components',
                    typeOptions: [
                        {
                            name: AppFieldType.CHECKBOX,
                            displayName: 'Checkbox',
                        },
                        {
                            name: AppFieldType.INPUT,
                            displayName: 'Input',
                        },
                        {
                            name: AppFieldType.INPUT,
                            displayName: 'Number',
                            customName: AppCustomFieldType.NUMBER,
                        },
                        {
                            name: AppFieldType.RADIO,
                            displayName: 'Radio',
                        },
                        {
                            name: AppFieldType.SELECT,
                            displayName: 'Select',
                        },
                        {
                            name: AppFieldType.TEXTAREA,
                            displayName: 'Textarea',
                        },
                    ],
                },
                {
                    name: 'Containers',
                    typeOptions: [
                        {
                            name: AppFieldType.FORMLY_GROUP,
                            displayName: 'Group',
                            canHaveChildren: true,
                            childrenPath: 'fieldGroup',
                        },
                        {
                            name: AppFieldType.FORMLY_GROUP,
                            displayName: 'Card',
                            customName: AppCustomFieldType.CARD,
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
                    name: 'Others',
                    typeOptions: [
                        {
                            name: AppFieldType.OTHER,
                            displayName: 'Other',
                        },
                    ],
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
                            //   console.log('state', state);
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
