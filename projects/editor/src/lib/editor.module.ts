import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule, MAT_TABS_CONFIG } from '@angular/material/tabs';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { FormlyConfig } from '@ngx-formly/core';
import { DndModule } from '@ng-dnd/core';
import { HTML5Backend } from '@ng-dnd/multi-backend';

import { EditorConfig, EDITOR_CONFIG, EditorFieldType } from './editor.types';
import { EditorService } from './editor.service';
import { FormModule } from './form/form.module';
import { FileService } from './shared/services/file-service/file.service';
import { EditorComponent } from './editor.component';
import { SidebarModule } from './sidebar/sidebar.module';
import { MatMenuModule } from '@angular/material/menu';
import { FieldNameModule } from './field-name/field-name.module';
import { EditFieldModule } from './edit-field/edit-field.module';
import { TreeItemModule } from './tree-item/tree-item.module';
import { CustomFormlyModule } from './custom-formly/custom-formly.module';
import { ActionReducer, META_REDUCERS, StoreModule } from '@ngrx/store';
import { editorFeature } from './state/state.reducers';
import { PropertyModule } from './property/property.module';
import { JSONDialogModule } from './json-dialog/json-dialog.module';
import { FieldTreeItemComponent } from './field-tree-item/field-tree-item.component';
import { GenericFieldService } from './field-service/generic/generic-field.service';
import { FormlyGroupComponent } from './custom-formly/formly-group/formly-group.component';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

const defaultConfig: EditorConfig = {
    options: [],
};

const metaReducerFactory =
    () =>
    (reducer: ActionReducer<any>): ActionReducer<any> =>
    (state, action) => {
        console.log('Action:', action.type);
        return reducer(state, action);
    };

@NgModule({
    declarations: [EditorComponent, FieldTreeItemComponent],
    imports: [
        CommonModule,
        FormModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatMenuModule,
        SidebarModule,
        FieldNameModule,
        EditFieldModule,
        TreeItemModule,
        PropertyModule,
        JSONDialogModule,
        CustomFormlyModule,
        StoreModule.forFeature(editorFeature),
        DndModule.forRoot({ backend: HTML5Backend }),
    ],
    exports: [EditorComponent],
    providers: [
        GenericFieldService,
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
        {
            provide: META_REDUCERS,
            useFactory: metaReducerFactory,
            multi: true,
        },
    ],
})
export class EditorModule {
    constructor(
        editorService: EditorService,
        formlyConfig: FormlyConfig,
        @Optional() @Inject(EDITOR_CONFIG) config: EditorConfig
    ) {
        // Setup editor
        editorService.setup(config ?? defaultConfig);
        // Override default formly-group
        formlyConfig.setType({
            name: EditorFieldType.FORMLY_GROUP,
            component: FormlyGroupComponent,
        });
    }

    static forRoot(config: EditorConfig): ModuleWithProviders<EditorModule> {
        return {
            ngModule: EditorModule,
            providers: [
                {
                    provide: EDITOR_CONFIG,
                    useValue: config,
                },
            ],
        };
    }
}
