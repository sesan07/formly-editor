import { Component } from '@angular/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { EditorComponent } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-bootstrap',
    template: ` <editor-main autosaveStorageKey="editor-bootstrap"></editor-main> `,
    standalone: true,
    imports: [FormlyBootstrapModule, EditorComponent],
})
export class BootstrapComponent {}
