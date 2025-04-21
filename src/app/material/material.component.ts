import { Component } from '@angular/core';
import { EditorComponent } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-material',
    template: ` <editor-main></editor-main> `,
    imports: [EditorComponent],
})
export class MaterialComponent {}
