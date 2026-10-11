import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Divider } from 'primeng/divider';

import { RouterLink } from '@angular/router';
import { ResponsiveService } from './responsive.service';
import { ThemeToggle } from './theme-toggle';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggle, Divider, RouterLink, ButtonDirective, ButtonIcon, ButtonLabel],
  host: {
    class: 'flex flex-col overflow-hidden',
  },
  template: `
    <div class="flex min-h-0 flex-1 items-center justify-between gap-2 px-4 py-1">
      <div class="flex min-w-0 items-center">
        <h1 class="truncate text-xl font-bold">
          <a
            routerLink="/"
            aria-label="Go to Formly Studio home page"
            >Formly Studio</a
          >
        </h1>
      </div>
      <div class="flex min-w-0 shrink items-center justify-end gap-1">
        <a
          pButton
          text
          rounded
          class="shrink-0"
          aria-label="Open Formly Studio documentation"
          title="Documentation"
          target="_blank"
          rel="noopener noreferrer"
          [href]="docsUrl"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            menu_book
          </i>
          @if (!isMobile()) {
            <span pButtonLabel>Docs</span>
          }
        </a>
        <a
          pButton
          text
          rounded
          class="shrink-0"
          aria-label="Open ngx-formly website"
          title="ngx-formly"
          target="_blank"
          rel="noopener noreferrer"
          [href]="formlyUrl"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
          >
            language
          </i>
          @if (!isMobile()) {
            <span pButtonLabel>ngx-formly</span>
          }
        </a>
        <app-theme-toggle />
      </div>
    </div>
    <p-divider class="h-0.5" />
  `,
})
export class Header {
  readonly responsiveService = inject(ResponsiveService);

  isMobile = this.responsiveService.isMobile;

  protected readonly docsUrl = isDevMode()
    ? 'http://localhost:4321/'
    : 'https://docs.formlystudio.com/';
  protected readonly formlyUrl = 'https://formly.dev/';
}
