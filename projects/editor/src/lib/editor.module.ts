import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MAT_TABS_CONFIG, MatTabsModule } from '@angular/material/tabs';
import { DndModule } from '@ng-dnd/core';
import { HTML5Backend } from '@ng-dnd/multi-backend';
import { FormlyConfig } from '@ngx-formly/core';

import { ActionReducer, META_REDUCERS, StoreModule } from '@ngrx/store';
import { AddFieldTreeItemModule } from './add-field-tree-item/add-field-tree-item.module';
import { CustomFormlyModule } from './custom-formly/custom-formly.module';
import { FormlyGroupComponent } from './custom-formly/formly-group/formly-group.component';
import { EditFieldModule } from './edit-field/edit-field.module';
import { EditorComponent } from './editor.component';
import { EditorService } from './editor.service';
import { EDITOR_CONFIG, EditorConfig, EditorFieldType } from './editor.types';
import { FieldNameModule } from './field-name/field-name.module';
import { GenericFieldService } from './field-service/generic/generic-field.service';
import { FieldTreeItemModule } from './field-tree-item/field-tree-item.module';
import { FormModule } from './form/form.module';
import { JSONDialogModule } from './json-dialog/json-dialog.module';
import { PropertyModule } from './property/property.module';
import { FileService } from './shared/services/file-service/file.service';
import { SidebarModule } from './sidebar/sidebar.module';
import { editorFeature } from './state/state.reducers';

import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';

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
    declarations: [EditorComponent],
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
        AddFieldTreeItemModule,
        FieldTreeItemModule,
        PropertyModule,
        JSONDialogModule,
        CustomFormlyModule,
        StoreModule.forFeature(editorFeature),
        DndModule.forRoot({ backend: HTML5Backend }),
    ],
    exports: [EditorComponent],
    providers: [
        GenericFieldService,
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
    constructor(formlyConfig: FormlyConfig) {
        // Override default formly-group
        formlyConfig.setType({
            name: EditorFieldType.FORMLY_GROUP,
            component: FormlyGroupComponent,
        });
    }

    static forRoot(config?: EditorConfig): ModuleWithProviders<EditorModule> {
        return {
            ngModule: EditorModule,
            providers: [
                {
                    provide: EDITOR_CONFIG,
                    useValue: config ?? defaultConfig,
                },
                EditorService,
            ],
        };
    }
}
