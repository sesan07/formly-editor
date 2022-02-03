import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormlyModule, FORMLY_CONFIG } from '@ngx-formly/core';
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
import { EditorFormlyGroupComponent } from './components/editor-formly-group/editor-formly-group.component';
import { EditorConfigOption, EditorTypeOption, EDITOR_CONFIG } from './editor.types';
import { FormService } from './services/form-service/form.service';
import { cloneDeep } from 'lodash-es';
import { TypeOption } from '@ngx-formly/core/lib/services/formly.config';
import { FieldCategoryListComponent } from './components/field-category-list/field-category-list.component';

const defaultConfig: EditorConfigOption = {
    defaultName: 'formly-group',
    typeCategories: []
};


@NgModule({
    declarations: [
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
        FieldCategoryListComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        FormlyModule.forChild({
            types: [{ name: FieldType.FORMLY_GROUP, component: EditorFormlyGroupComponent }],
            wrappers: [{ name: WrapperType.EDITOR, component: EditorWrapperComponent }],
        }),
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
    exports: [
        HomeComponent
    ]
})
export class EditorModule {

    constructor(formService: FormService, @Optional() @Inject(EDITOR_CONFIG) config: EditorConfigOption) {
        formService.setup(config ?? defaultConfig);
    }

    static forRoot(config: EditorConfigOption): ModuleWithProviders<EditorModule> {
        const typeOptionMap: Map<string, EditorTypeOption> = new Map();
        config.typeCategories.forEach(category => {
            category.typeOptions.forEach(typeOption => {
                if (!typeOptionMap.has(typeOption.name) && !typeOption.customName) {
                    const copy: EditorTypeOption = cloneDeep(typeOption);
                    delete copy.displayName;
                    delete copy.customName;
                    delete copy.canHaveChildren;

                    typeOptionMap.set(copy.name, copy);
                }
            });
        });
        const types: TypeOption[] = Array.from(typeOptionMap.values());

        const formlyConfig: EditorConfigOption = cloneDeep(config);
        formlyConfig.types = types;
        delete formlyConfig.defaultName;
        delete formlyConfig.defaultCustomName;
        delete formlyConfig.typeCategories;

        const editorConfig: EditorConfigOption = {
            defaultName: config.defaultName,
            defaultCustomName: config.defaultCustomName,
            typeCategories: config.typeCategories,
         };

        return {
            ngModule: EditorModule,
            providers: [
                { provide: EDITOR_CONFIG, useValue: editorConfig, deps: [FormService] },
                { provide: FORMLY_CONFIG, useValue: formlyConfig, multi: true },
            ],
        };
    }
}
