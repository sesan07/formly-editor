import { Component } from '@angular/core';
import { IStylesConfig, tailwindConfig } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-material',
    template: ` <editor-main [stylesConfig]="tailwindConfig"> </editor-main> `,
})
export class MaterialComponent {
    tailwindConfig: IStylesConfig = tailwindConfig;
}
