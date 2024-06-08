import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { DndService, provideDnd } from '@ng-dnd/core';
import { HTML5Backend } from '@ng-dnd/multi-backend';
import { ActionReducer, META_REDUCERS, provideState, provideStore } from '@ngrx/store';
import { ConfigOption, FORMLY_CONFIG } from '@ngx-formly/core';

import { FormlyGroupComponent } from './custom-formly/formly-group/formly-group.component';
import { StylesService } from './edit-field/styles/styles.service';
import { EditorService } from './editor.service';
import { EDITOR_CONFIG, EditorConfig, EditorFieldType, FieldTypeOption } from './editor.types';
import { FieldService } from './field-service/field.service';
import { createEditorFeature } from './state/state.reducers';
import { EDITOR_FEATURE, EditorFeature } from './state/state.types';

const metaReducerFactory =
    () =>
    (reducer: ActionReducer<any>): ActionReducer<any> =>
    (state, action) => {
        console.log('Action:', action.type);
        return reducer(state, action);
    };

const defaultConfig: EditorConfig = {
    id: 'editor',
    fieldOptions: [],
};

const defaultGenericTypeOption: FieldTypeOption = {
    displayName: 'Generic',
    name: EditorFieldType.GENERIC,
    disableKeyGeneration: true,
    defaultConfig: {},
};

export function provideEditor(configProviders?: EnvironmentProviders): EnvironmentProviders {
    return makeEnvironmentProviders([
        ...(configProviders ? [configProviders] : []),
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
        provideStore(),
        provideDnd({ backend: HTML5Backend }),
        DndService,
    ]);
}

export function provideEditorConfig(config: EditorConfig = defaultConfig): EnvironmentProviders {
    return withConfig(config);
}

export function withConfig(config: EditorConfig): EnvironmentProviders {
    config.genericTypeOption = config.genericTypeOption ?? defaultGenericTypeOption;
    const feature: EditorFeature = createEditorFeature(config.id);
    const formlyConfig: ConfigOption = { types: [{ name: 'formly-group', component: FormlyGroupComponent }] };

    return makeEnvironmentProviders([
        {
            provide: EDITOR_CONFIG,
            useValue: config,
        },
        {
            provide: EDITOR_FEATURE,
            useValue: feature,
        },
        {
            provide: FORMLY_CONFIG,
            useValue: formlyConfig,
            multi: true,
        },
        provideState(feature),
        EditorService,
        FieldService,
        StylesService,
    ]);
}
