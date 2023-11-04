import { Component } from '@angular/core';
import { IStylesConfig, bootstrapConfig } from '@sesan07/ngx-formly-editor';

@Component({
    selector: 'app-bootstrap',
    template: '<editor-main [stylesConfig]="bootstrapConfig"></editor-main>',
    styles: [
        `
            :host {
                display: block;
                height: 100%;
            }
        `,
    ],
})
export class BootstrapComponent {
    bootstrapConfig: IStylesConfig = bootstrapConfig;
}
