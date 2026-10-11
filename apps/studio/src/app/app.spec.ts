import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';
import { FormEditorApp } from './form-editor/form-editor';

describe('App', () => {
  beforeEach(async () => {
    TestBed.overrideComponent(FormEditorApp, {
      set: { imports: [], template: '' },
    });
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Formly Studio');
  });

  it('renders the header and routed home content directly in the root layout', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector(':scope > app-header')).not.toBeNull();
    expect(root.querySelector(':scope > main > router-outlet')).not.toBeNull();
    expect(root.querySelector(':scope > main > app-home-page')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Formly Studio | Visual ngx-formly Form Builder');
  });

  it.each(['/form-editor', '/form-editor/unknown', '/unknown'])(
    'resolves %s to the editor with its route title',
    async (url) => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const router = TestBed.inject(Router);

      await router.navigateByUrl(url);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/form-editor');
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector(':scope > main > app-form-editor')).not.toBeNull();
      expect(TestBed.inject(Title).getTitle()).toBe('Form Editor | Formly Studio');

      await router.navigateByUrl('/');
      await fixture.whenStable();
      expect(TestBed.inject(Title).getTitle()).toBe(
        'Formly Studio | Visual ngx-formly Form Builder',
      );
    },
  );
});
