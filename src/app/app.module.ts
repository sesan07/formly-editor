import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditorModule } from './editor/editor.module';
import { AppRoutingModule } from './app-routing.module';
import { EDITOR_FIELD_SERVICE } from './editor/services/form-service/form.types';
import { FieldService } from './services/field-services/field-service';
import { CustomFieldType, FieldType } from './services/field-services/field.types';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        EditorModule.forRoot({
            defaultType: FieldType.FORMLY_GROUP,
            fieldCategories: [
                {
                    name: 'Basic',
                    fields: [
                        {
                            name: 'Checkbox',
                            type: FieldType.CHECKBOX,
                        },
                        {
                            name: 'Formly Group',
                            type: FieldType.FORMLY_GROUP,
                        },
                        {
                            name: 'Input',
                            type: FieldType.INPUT,
                        },
                        {
                            name: 'Other',
                            type: FieldType.OTHER,
                        },
                        {
                            name: 'Radio',
                            type: FieldType.RADIO,
                        },
                        {
                            name: 'Select',
                            type: FieldType.SELECT,
                        },
                        {
                            name: 'Textarea',
                            type: FieldType.TEXTAREA,
                        },
                    ]
                },
                {
                    name: 'Custom',
                    fields: [
                        {
                            name: 'Number',
                            type: FieldType.INPUT,
                            customType: CustomFieldType.NUMBER
                        },
                    ]
                }
            ]
        })
    ],
    providers: [{ provide: EDITOR_FIELD_SERVICE, useClass: FieldService }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
