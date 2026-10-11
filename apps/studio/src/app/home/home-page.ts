import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreateFormDialogService, ImportDialogService } from '@formly-editor/core';
import { ActionButton } from './action-button';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionButton],
  host: {
    class:
      'block h-full overflow-auto bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--p-primary-color)_12%,transparent),transparent_32rem)]',
  },
  template: `
    <main
      class="mx-auto grid min-h-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24 lg:px-12"
    >
      <section>
        <p class="mb-5 text-sm font-semibold tracking-wide text-primary uppercase">
          The visual authoring companion for ngx-formly
        </p>
        <h1 class="mb-6 max-w-2xl text-4xl font-semibold tracking-tight text-color md:text-6xl">
          Build ngx-formly forms visually.
        </h1>
        <p class="text-color-secondary max-w-xl text-lg leading-8">
          Formly Studio is a visual authoring tool for ngx-formly, the JSON-powered dynamic forms
          library for Angular. Create, preview, and export Formly field configurations with
          templates to help you get started.
        </p>
        <a
          class="mt-5 inline-flex items-center font-medium text-primary underline underline-offset-4"
          href="https://formly.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn about ngx-formly
        </a>
        <p class="text-color-secondary mt-5 max-w-xl text-sm">
          {{ persistenceDescription }}
        </p>
      </section>

      <section
        class="border-l border-primary/30 pl-6 lg:pl-8"
        aria-labelledby="start-building-heading"
      >
        <p
          id="start-building-heading"
          class="mb-5 text-sm font-semibold text-color"
        >
          Start building
        </p>
        <div class="grid gap-3">
          <app-action-button
            icon="add_circle"
            label="Create Form"
            description="Start blank or choose a template"
            (activated)="createForm()"
          />

          <app-action-button
            icon="upload"
            label="Import Form"
            description="Bring an existing Formly field configuration into the editor"
            text
            (activated)="importForm()"
          />

          <app-action-button
            icon="edit_note"
            label="Open Form Editor"
            description="Continue with an existing form"
            text
            (activated)="openEditor()"
          />
        </div>
      </section>
    </main>
  `,
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly createFormDialogService = inject(CreateFormDialogService);
  private readonly importDialogService = inject(ImportDialogService);
  protected readonly persistenceDescription =
    'No account required. Your forms stay in this browser.';

  async createForm(): Promise<void> {
    if (await this.router.navigateByUrl('/form-editor')) {
      this.createFormDialogService.open();
    }
  }

  async importForm(): Promise<void> {
    if (await this.router.navigateByUrl('/form-editor')) {
      this.importDialogService.open();
    }
  }

  openEditor(): void {
    void this.router.navigateByUrl('/form-editor');
  }
}
