import { Component } from '@angular/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { EditorComponent } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-material',
    template: ` <editor-main autosaveStorageKey="editor-material"></editor-main> `,
    standalone: true,
    imports: [FormlyMaterialModule, EditorComponent],
})
export class MaterialComponent {}
