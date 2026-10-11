import { EnvironmentProviders, makeEnvironmentProviders, signal, Type } from '@angular/core';
import { ConfigOption, FormlyFieldConfig, provideFormlyConfig } from '@ngx-formly/core';
import { CoreFieldService } from './config/core-field.service';
import { CoreLibraryService } from './config/core-library.service';
import { defaultTypeOption } from './config/library';
import {
  CORE_EDITOR_CONFIG,
  CORE_LIBRARY_CONFIGS,
  CoreEditorConfig,
  LibraryConfig,
} from './config/types';
import { BuilderFieldStateService } from './editor/builder-field-state.service';
import { CoreFormService } from './editor/core-form.service';
import { DNDService } from './editor/dnd.service';
import { PanelService } from './editor/panel.service';
import { FieldPresetDialogService } from './field-preset/field-preset-dialog.service';
import { CoreFieldWrapper } from './formly/field-wrapper';
import { FieldInfo } from './model/types';
import { tailwindConfig } from './panel/styling-panel/config/tailwind';
import { CORE_STYLES_CONFIG } from './panel/styling-panel/types';
import { LocalFormStoreService } from './persistence/local-form-store.service';
import { CORE_FORM_STORE, FormStoreService } from './persistence/types';
import { ArrayTableDialogService } from './properties/array/array-table-dialog.service';
import { ExpressionDialogService } from './properties/expressions/expression-dialog.service';
import { MarkdownDialogService } from './properties/markdown/markdown-dialog.service';
import { CORE_THEME } from './theme';

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    CoreFormService,
    CoreFieldService,
    {
      provide: CORE_STYLES_CONFIG,
      useValue: tailwindConfig,
    },
    PanelService,
    FieldPresetDialogService,
    ExpressionDialogService,
    MarkdownDialogService,
    ArrayTableDialogService,
    DNDService,
    BuilderFieldStateService,
  ]);
}

export function provideCoreTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CORE_THEME,
      useFactory: () => signal('light'),
    },
  ]);
}

export function provideCoreConfig(
  libraryConfig: LibraryConfig[],
  autoSave = true,
): EnvironmentProviders {
  const editorConfig: CoreEditorConfig = {
    editorType: 'form-editor',
    defaultTypeOption,
    autoSave,
  };
  const formlyConfig: ConfigOption = {
    wrappers: [{ name: 'core-field', component: CoreFieldWrapper }],
    extensions: [
      {
        name: 'core-field',
        extension: {
          postPopulate(field: FormlyFieldConfig & { _info?: FieldInfo }) {
            if (field._info) {
              // Ensure there is one instance of 'core-field' wrapper
              if (field.wrappers) {
                field.wrappers = field.wrappers.includes('core-field')
                  ? field.wrappers
                  : ['core-field', ...field.wrappers];
              } else {
                field.wrappers = ['core-field'];
              }
            }
          },
        },
      },
    ],
  };

  return makeEnvironmentProviders([
    {
      provide: CORE_EDITOR_CONFIG,
      useValue: editorConfig,
    },
    {
      provide: CORE_LIBRARY_CONFIGS,
      useValue: libraryConfig,
    },
    CoreLibraryService,
    provideFormlyConfig(formlyConfig),
  ]);
}

export function provideFormStore(service: Type<FormStoreService>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CORE_FORM_STORE,
      useExisting: service,
    },
  ]);
}

export function provideLocalFormStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CORE_FORM_STORE,
      useClass: LocalFormStoreService,
    },
  ]);
}
