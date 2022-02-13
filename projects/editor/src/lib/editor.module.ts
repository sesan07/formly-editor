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
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { EditorWrapperComponent } from './components/editor-wrapper/editor-wrapper.component';
import { FormComponent } from './components/form/form.component';
import { InputPropertyComponent } from './components/property/input-property/input-property.component';
import { ObjectPropertyComponent } from './components/property/object-property/object-property.component';
import { FormViewComponent } from './components/form/form-view/form-view.component';
import { ArrayPropertyComponent } from './components/property/array-property/array-property.component';
import { BooleanPropertyComponent } from './components/property/boolean-property/boolean-property.component';
import { FieldTreeItemComponent } from './components/field-tree-item/field-tree-item.component';
import { ChipListPropertyComponent } from './components/property/chip-list-property/chip-list-property.component';
import { FieldType, WrapperType } from './services/editor-service/editor.types';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EditorComponent } from './components/editor/editor.component';
import { SidebarSectionComponent } from './components/sidebar-section/sidebar-section.component';
import { EditorFormlyGroupComponent } from './components/editor-formly-group/editor-formly-group.component';
import { EditorConfigOption, EditorTypeOption, EDITOR_CONFIG } from './editor.types';
import { EditorService } from './services/editor-service/editor.service';
import { cloneDeep } from 'lodash-es';
import { TypeOption } from '@ngx-formly/core/lib/services/formly.config';
import { FieldCategoryListComponent } from './components/field-category-list/field-category-list.component';
import { ImportFormDialogComponent } from './components/import-form-dialog/import-form-dialog.component';
import { JsonValidatorDirective } from './components/import-form-dialog/json-validator/json-validator.directive';
import { ExportFormDialogComponent } from './components/export-form-dialog/export-form-dialog.component';

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
        EditorComponent,
        SidebarSectionComponent,
        EditorFormlyGroupComponent,
        FieldCategoryListComponent,
        ImportFormDialogComponent,
        ExportFormDialogComponent,
        JsonValidatorDirective,
    ],
    imports: [
        CommonModule,
        FormsModule,
        FormlyModule.forRoot({
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
        MatDialogModule,
        MatButtonToggleModule,
    ],
    exports: [
        EditorComponent
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                height: '80%',
                width: '80%',
                maxHeight: '675px',
                maxWidth: '1200px'
            }
        }
    ]
})
export class EditorModule {

    constructor(editorService: EditorService, @Optional() @Inject(EDITOR_CONFIG) config: EditorConfigOption) {
        editorService.setup(config ?? defaultConfig);
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
                { provide: EDITOR_CONFIG, useValue: editorConfig, deps: [EditorService] },
                { provide: FORMLY_CONFIG, useValue: formlyConfig, multi: true },
            ],
        };
    }
}
