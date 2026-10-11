import { Routes } from '@angular/router';
import { provideFormEditor } from './form-editor.provider';

export const formEditorRoutes: Routes = [
  {
    path: '',
    providers: [provideFormEditor()],
    children: [
      {
        title: 'Form Editor | Formly Studio',
        path: '',
        loadComponent: () => import('./form-editor').then((m) => m.FormEditorApp),
      },
    ],
  },
];
