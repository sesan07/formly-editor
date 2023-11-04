import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: 'bootstrap', loadChildren: () => import('./bootstrap/bootstrap.module').then(m => m.BootstrapModule) },
    { path: 'material', loadChildren: () => import('./material/material.module').then(m => m.MaterialModule) },
    { path: '**', redirectTo: 'material' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
