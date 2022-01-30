import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EditorWrapperComponent } from './components/editor-wrapper/editor-wrapper.component';
import { FormComponent } from './components/form/form.component';
import { InputPropertyComponent } from './components/property/input-property/input-property.component';
import { ObjectPropertyComponent } from './components/property/object-property/object-property.component';
import { FormViewComponent } from './components/form/form-view/form-view.component';
import { ArrayPropertyComponent } from './components/property/array-property/array-property.component';
import { BooleanPropertyComponent } from './components/property/boolean-property/boolean-property.component';
import { FieldTreeItemComponent } from './components/field-tree-item/field-tree-item.component';
import { ChipListPropertyComponent } from './components/property/chip-list-property/chip-list-property.component';
import { FieldType, WrapperType } from './services/form-service/form.types';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HomeComponent } from './components/home/home.component';
import { SidebarSectionComponent } from './components/sidebar-section/sidebar-section.component';
import { HttpClientModule } from '@angular/common/http';
import { EditorFormlyGroupComponent } from './components/editor-formly-group/editor-formly-group.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorWrapperComponent,
        FormComponent,
        InputPropertyComponent,
        ObjectPropertyComponent,
        FormViewComponent,
        ArrayPropertyComponent,
        BooleanPropertyComponent,
        FieldTreeItemComponent,
        ChipListPropertyComponent,
        HomeComponent,
        SidebarSectionComponent,
        EditorFormlyGroupComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
		HttpClientModule,
        FormsModule,
        FormlyModule.forRoot({
            types: [{ name: FieldType.FORMLY_GROUP, component: EditorFormlyGroupComponent }],
            wrappers: [{ name: WrapperType.EDITOR, component: EditorWrapperComponent }],
			validationMessages: [
			  	{ name: 'required', message: 'This field is required' },
			],
        }),
        FormlyMaterialModule,
        MatTreeModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatSelectModule,
        MatChipsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatTabsModule,
        MatSlideToggleModule,
        DragDropModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
}
