import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import {MatCardModule} from '@angular/material/card';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FieldService } from './services/field-services/field-service';
import { CustomFieldType, FieldType, WrapperType } from './services/field-services/field.types';
import { CardWrapperComponent } from './components/card-wrapper/card-wrapper.component';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { HttpClientModule } from '@angular/common/http';
import { EditorModule, EDITOR_FIELD_SERVICE } from 'editor';

@NgModule({
    declarations: [
        AppComponent,
        CardWrapperComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        MatCardModule,
        FormlyMaterialModule,
        EditorModule.forRoot({
            defaultName: FieldType.FORMLY_GROUP,
            typeCategories: [
                {
                    name: 'Basic',
                    typeOptions: [
                        {
                            name: FieldType.CHECKBOX,
                            displayName: 'Checkbox',
                        },
                        {
                            name: FieldType.FORMLY_GROUP,
                            displayName: 'Formly Group',
                            canHaveChildren: true,
                        },
                        {
                            name: FieldType.INPUT,
                            displayName: 'Input',
                        },
                        {
                            name: FieldType.OTHER,
                            displayName: 'Other',
                        },
                        {
                            name: FieldType.RADIO,
                            displayName: 'Radio',
                        },
                        {
                            name: FieldType.SELECT,
                            displayName: 'Select',
                        },
                        {
                            name: FieldType.TEXTAREA,
                            displayName: 'Textarea',
                        },
                    ]
                },
                {
                    name: 'Custom',
                    typeOptions: [
                        {
                            name: FieldType.INPUT,
                            displayName: 'Number',
                            customName: CustomFieldType.NUMBER
                        },
                        {
                            name: FieldType.FORMLY_GROUP,
                            displayName: 'Card',
                            customName: CustomFieldType.CARD,
                            canHaveChildren: true,
                        },
                    ]
                }
            ],
            wrappers: [{ name: WrapperType.CARD, component: CardWrapperComponent }],
            validationMessages: [
                { name: 'required', message: 'This field is required' },
            ],
        }),
    ],
    providers: [{ provide: EDITOR_FIELD_SERVICE, useClass: FieldService }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
