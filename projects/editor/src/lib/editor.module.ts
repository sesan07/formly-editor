import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FORMLY_CONFIG, TypeOption } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatTabsModule, MAT_TABS_CONFIG } from '@angular/material/tabs';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { EditorConfigOption, EditorTypeOption, EDITOR_CONFIG } from './editor.types';
import { EditorService } from './editor.service';
import { CustomFormlyModule } from './custom-formly/custom-formly.module';
import { FormModule } from './form/form.module';
import { FileService } from './shared/services/file-service/file.service';
import { installPatch } from './dnd-patch';

import 'codemirror/mode/javascript/javascript';
import { EditorComponent } from './editor.component';
import { SidebarModule } from './sidebar/sidebar.module';
import { MatMenuModule } from '@angular/material/menu';
import { FieldNameModule } from './field-name/field-name.module';
import { TextEditorModule } from './text-editor/text-editor.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EditFieldModule } from './edit-field/edit-field.module';
import { FieldTreeItemComponent } from './form/field-tree-item/field-tree-item.component';
import { TreeItemModule } from './tree-item/tree-item.module';
import { StoreModule } from '@ngrx/store';
import { editorFeature } from './state/state.reducers';
import { PropertyModule } from './property/property.module';
import { MainComponent } from './main/main.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const defaultConfig: EditorConfigOption = {
    defaultName: 'formly-group',
    typeCategories: [],
};

@NgModule({
    declarations: [EditorComponent, FieldTreeItemComponent, MainComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        FormModule,
        CustomFormlyModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        SidebarModule,
        FieldNameModule,
        TextEditorModule,
        EditFieldModule,
        TreeItemModule,
        PropertyModule,
        StoreModule.forFeature(editorFeature),
    ],
    exports: [EditorComponent, CustomFormlyModule],
    providers: [
        EditorService,
        FileService,
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                height: '80%',
                width: '80%',
                maxHeight: '675px',
                maxWidth: '1200px',
                hasBackdrop: true,
            },
        },
        {
            provide: MAT_TABS_CONFIG,
            useValue: {
                animationDuration: '250ms',
            },
        },
    ],
})
export class EditorModule {
    constructor(editorService: EditorService, @Optional() @Inject(EDITOR_CONFIG) config: EditorConfigOption) {
        editorService.setup(config ?? defaultConfig);

        // Patch drag/drop to improve nesting support
        installPatch();
    }

    static forRoot(config: EditorConfigOption): ModuleWithProviders<EditorModule> {
        const typeOptionMap: Map<string, EditorTypeOption> = new Map();
        config.typeCategories.forEach(category => {
            category.typeOptions.forEach(typeOption => {
                if (!typeOptionMap.has(typeOption.name) && !typeOption.customName) {
                    const copy: EditorTypeOption = { ...typeOption };
                    delete copy.displayName;
                    delete copy.customName;
                    delete copy.canHaveChildren;
                    delete copy.childrenPath;

                    typeOptionMap.set(copy.name, copy);
                }
            });
        });
        const types: TypeOption[] = Array.from(typeOptionMap.values());

        const formlyConfig: EditorConfigOption = { ...config };
        formlyConfig.types = types;
        delete formlyConfig.defaultName;
        delete formlyConfig.defaultCustomName;
        delete formlyConfig.unknownTypeName;
        delete formlyConfig.typeCategories;

        const editorConfig: EditorConfigOption = {
            defaultName: config.defaultName,
            defaultCustomName: config.defaultCustomName,
            unknownTypeName: config.unknownTypeName,
            typeCategories: config.typeCategories,
        };

        return {
            ngModule: EditorModule,
            providers: [
                {
                    provide: EDITOR_CONFIG,
                    useValue: editorConfig,
                    deps: [EditorService],
                },
                { provide: FORMLY_CONFIG, useValue: formlyConfig, multi: true },
            ],
        };
    }
}
