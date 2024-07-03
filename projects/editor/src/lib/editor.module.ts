import { ModuleWithProviders, NgModule } from '@angular/core';

import { EditorComponent } from './editor.component';
import { provideEditor, provideEditorConfig, withConfig } from './editor.provider';
import { EditorConfig } from './editor.types';

@NgModule({
    imports: [EditorComponent],
    exports: [EditorComponent],
})
export class EditorModule {
    static forRoot(config?: EditorConfig): ModuleWithProviders<EditorModule> {
        return {
            ngModule: EditorModule,
            providers: [provideEditor(config ? withConfig(config) : undefined)],
        };
    }
    static forChild(config: EditorConfig): ModuleWithProviders<EditorModule> {
        return {
            ngModule: EditorModule,
            providers: [provideEditorConfig(config)],
        };
    }
}
