import { TestBed } from '@angular/core/testing';

import { ThemeToggleService } from './theme-toggle.service';

describe('ThemeToggleService', () => {
  const stylesheetId = 'ng-zorro-dark-theme';

  beforeEach(() => {
    localStorage.clear();
    document.getElementById(stylesheetId)?.remove();
  });

  function createService(): ThemeToggleService {
    TestBed.configureTestingModule({ providers: [ThemeToggleService] });
    return TestBed.inject(ThemeToggleService);
  }

  it('does not create a dark stylesheet for the light theme', () => {
    const service = createService();

    expect(service.theme()).toBe('light');
    expect(document.getElementById(stylesheetId)).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('enables one dark stylesheet when switching to dark mode', () => {
    const service = createService();

    service.toggleTheme();

    const stylesheet = document.getElementById(stylesheetId) as HTMLLinkElement;
    expect(service.theme()).toBe('dark');
    expect(stylesheet.rel).toBe('stylesheet');
    expect(stylesheet.href).toContain('ng-zorro-dark.css');
    expect(stylesheet.disabled).toBe(false);
    expect(document.querySelectorAll(`#${stylesheetId}`)).toHaveLength(1);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('disables the existing dark stylesheet when switching back to light mode', () => {
    const service = createService();

    service.toggleTheme();
    service.toggleTheme();

    const stylesheet = document.getElementById(stylesheetId) as HTMLLinkElement;
    expect(service.theme()).toBe('light');
    expect(stylesheet.disabled).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('restores a persisted dark theme without creating duplicate stylesheets', () => {
    localStorage.setItem('formly-studio-theme', 'dark');

    const service = createService();
    service.toggleTheme();

    expect(service.theme()).toBe('light');
    expect(document.querySelectorAll(`#${stylesheetId}`)).toHaveLength(1);
  });
});
