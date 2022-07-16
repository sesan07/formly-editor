import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FORMLY_CONFIG, TypeOption } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { cloneDeep } from 'lodash-es';

import { EditorConfigOption, EditorTypeOption, EDITOR_CONFIG } from './services/editor-service/editor.types';
import { HomeComponent } from './components/home/home.component';
import { EditorService } from './services/editor-service/editor.service';
import { installPatch } from './dnd-patch';
import { FileService } from './services/file-service/file.service';
import { CustomFormlyModule } from './components/custom-formly/custom-formly.module';
import { FormModule } from './components/form/form.module';

const defaultConfig: EditorConfigOption = {
    defaultName: 'formly-group',
    typeCategories: []
};


@NgModule({
    declarations: [
        HomeComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        FormModule,
        CustomFormlyModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
    ],
    exports: [
        HomeComponent,
        CustomFormlyModule,
    ],
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
                hasBackdrop: true
            }
        },
    ]
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
                    const copy: EditorTypeOption = cloneDeep(typeOption);
                    delete copy.displayName;
                    delete copy.customName;
                    delete copy.canHaveChildren;
                    delete copy.childrenPath;

                    typeOptionMap.set(copy.name, copy);
                }
            });
        });
        const types: TypeOption[] = Array.from(typeOptionMap.values());

        const formlyConfig: EditorConfigOption = cloneDeep(config);
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
                { provide: EDITOR_CONFIG, useValue: editorConfig, deps: [EditorService] },
                { provide: FORMLY_CONFIG, useValue: formlyConfig, multi: true },
            ],
        };
    }
}
