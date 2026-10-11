import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, RendererFactory2, signal } from '@angular/core';
import { CORE_THEME } from '@formly-editor/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeToggleService {
  protected readonly storageKey = 'formly-studio-theme';
  protected readonly darkStylesheetId = 'ng-zorro-dark-theme';
  protected readonly darkStylesheetHref = 'ng-zorro-dark.css';
  protected platformId = inject(PLATFORM_ID);
  protected document = inject(DOCUMENT);
  protected renderer = inject(RendererFactory2).createRenderer(null, null);
  protected coreTheme = inject(CORE_THEME, { optional: true });

  protected readonly themeSrc = signal<Theme>(this.getLocalStorageTheme());
  readonly theme = this.themeSrc.asReadonly();

  constructor() {
    this.setTheme(this.themeSrc());
  }

  toggleTheme(): void {
    this.setTheme(this.themeSrc() === 'dark' ? 'light' : 'dark');
  }

  protected setTheme(newTheme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, newTheme);
      this.themeSrc.set(newTheme);
      this.coreTheme?.set(newTheme);

      this.setDarkStylesheetEnabled(newTheme === 'dark');

      if (newTheme === 'dark') {
        this.renderer.addClass(this.document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(this.document.documentElement, 'dark');
      }

      this.renderer.setAttribute(this.document.documentElement, 'data-bs-theme', newTheme);
    }
  }

  protected setDarkStylesheetEnabled(enabled: boolean): void {
    let stylesheet = this.document.getElementById(this.darkStylesheetId) as HTMLLinkElement | null;

    if (!enabled && !stylesheet) {
      return;
    }

    if (!stylesheet) {
      stylesheet = this.renderer.createElement('link') as HTMLLinkElement;
      this.renderer.setAttribute(stylesheet, 'id', this.darkStylesheetId);
      this.renderer.setAttribute(stylesheet, 'rel', 'stylesheet');
      this.renderer.setAttribute(
        stylesheet,
        'href',
        new URL(this.darkStylesheetHref, this.document.baseURI).href,
      );
      this.renderer.appendChild(this.document.head, stylesheet);
    }

    stylesheet.disabled = !enabled;
  }

  protected getLocalStorageTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.storageKey) as 'light' | 'dark' | null;
      if (stored) return stored;
      if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
      return 'light';
    }
    return 'light';
  }
}
