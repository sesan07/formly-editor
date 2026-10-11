import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideCore, provideCoreConfig, provideLocalFormStore } from '@formly-editor/core';
import { provideFormlyCore } from '@ngx-formly/core';
import { bootstrapFormEditorConfig } from './bootstrap/bootstrap.library';
import { materialFormEditorConfig } from './material/material.library';
import { ngZorroFormEditorConfig } from './ng-zorro/ng-zorro.library';
import { studioMaterialFormEditorConfig } from './studio-material/studio-material.library';

export function provideFormEditor(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideFormlyCore(),
    provideCore(),
    provideCoreConfig([
      studioMaterialFormEditorConfig,
      materialFormEditorConfig,
      ngZorroFormEditorConfig,
      bootstrapFormEditorConfig,
    ]),
    provideLocalFormStore(),
  ]);
}
