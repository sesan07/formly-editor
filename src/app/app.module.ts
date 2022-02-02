import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditorModule } from './editor/editor.module';
import { AppRoutingModule } from './app-routing.module';
import { EDITOR_FIELD_SERVICE } from './editor/services/form-service/form.types';
import { FieldService } from './services/field-services/field-service';
import { FieldType } from './services/field-services/field.types';

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
                            type: 'checkbox',
                        }
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
