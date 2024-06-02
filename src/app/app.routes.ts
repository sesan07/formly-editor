import { Routes } from '@angular/router';
import { provideEditorConfig } from '@sesan07/ngx-formly-editor';

import { bootstrapEditorConfig } from './bootstrap/bootstrap.config';
import { provideBootstrap } from './bootstrap/bootstrap.provider';
import { materialEditorConfig } from './material/material.config';
import { provideMaterial } from './material/material.provider';

export const routes: Routes = [
    {
        path: 'bootstrap',
        loadComponent: () => import('./bootstrap/bootstrap.component').then(m => m.BootstrapComponent),
        providers: [provideBootstrap(), provideEditorConfig(bootstrapEditorConfig)],
    },
    {
        path: 'material',
        loadComponent: () => import('./material/material.component').then(m => m.MaterialComponent),
        providers: [provideMaterial(), provideEditorConfig(materialEditorConfig)],
    },
    { path: '**', redirectTo: 'material' },
];
