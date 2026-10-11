import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Header, RouterOutlet],
  host: {
    class: 'flex flex-col h-full bg-(--p-content-background)',
  },
  template: `
    <app-header class="h-(--app-header-height) shrink-0" />
    <main class="min-h-0 flex-1">
      <router-outlet />
    </main>
  `,
})
export class App {}
