import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ThemeToggleService } from './theme-toggle.service';
import { ResponsiveService } from './responsive.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, ButtonLabel],
  template: `
    <button
      pButton
      text
      rounded
      aria-label="Toggle Light/Dark Theme"
      (click)="toggleTheme()"
    >
      <i
        pButtonIcon
        class="material-symbols-outlined"
      >
        {{ iconName() }}
      </i>
      @if (!isMobile()) {
        <span pButtonLabel>{{ iconLabel() }}</span>
      }
    </button>
  `,
})
export class ThemeToggle {
  themeService = inject(ThemeToggleService);
  responsiveService = inject(ResponsiveService);

  isMobile = this.responsiveService.isMobile;

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');
  readonly iconName = computed(() => (this.isDarkMode() ? 'light_mode' : 'dark_mode'));
  readonly iconLabel = computed(() => (this.isDarkMode() ? 'Light' : 'Dark'));

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
