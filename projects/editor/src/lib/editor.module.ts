import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MAT_TABS_CONFIG, MatTabsModule } from '@angular/material/tabs';
import { DndModule } from '@ng-dnd/core';
import { HTML5Backend } from '@ng-dnd/multi-backend';
import { ActionReducer, META_REDUCERS, StoreModule } from '@ngrx/store';
import { FormlyConfig } from '@ngx-formly/core';



import { FormlyGroupComponent } from './custom-formly/formly-group/formly-group.component';

import { EditorComponent } from './editor.component';
import { EditorService } from './editor.service';
import { EDITOR_CONFIG, EditorConfig, EditorFieldType, FieldTypeOption } from './editor.types';





import { FileService } from './shared/services/file-service/file.service';

import { editorFeature } from './state/state.reducers';

import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import { FieldService } from './field-service/field.service';

const defaultConfig: EditorConfig = {
    fieldOptions: [],
};

const defaultGenericTypeOption: FieldTypeOption = {
    displayName: 'Generic',
    name: EditorFieldType.GENERIC,
    disableKeyGeneration: true,
    defaultConfig: {},
};

const metaReducerFactory =
    () =>
    (reducer: ActionReducer<any>): ActionReducer<any> =>
    (state, action) => {
        console.log('Action:', action.type);
        return reducer(state, action);
    };

@NgModule({
    imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    StoreModule.forFeature(editorFeature),
    DndModule.forRoot({ backend: HTML5Backend }),
    EditorComponent,
],
    exports: [EditorComponent],
    providers: [
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

    static forRoot(config: EditorConfig = defaultConfig): ModuleWithProviders<EditorModule> {
        config.genericTypeOption = config.genericTypeOption ?? defaultGenericTypeOption;

        return {
            ngModule: EditorModule,
            providers: [
                {
                    provide: EDITOR_CONFIG,
                    useValue: config,
                },
                EditorService,
                FieldService,
            ],
        };
    }
}
