import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideEditor } from '@sesan07/ngx-formly-editor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [provideHttpClient(), provideAnimations(), provideRouter(routes), provideEditor()],
};
