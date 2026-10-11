import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Formly Studio | Visual ngx-formly Form Builder',
    loadComponent: () => import('./home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'form-editor',
    loadChildren: () =>
      import('./form-editor/form-editor.routes').then((module) => module.formEditorRoutes),
  },
  { path: '**', redirectTo: 'form-editor' },
];
