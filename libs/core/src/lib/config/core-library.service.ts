import { computed, inject, Injectable, signal } from '@angular/core';
import { CORE_LIBRARY_CONFIGS, LibraryConfig } from './types';

@Injectable()
export class CoreLibraryService {
  protected readonly libraryConfigs = inject(CORE_LIBRARY_CONFIGS);
  readonly formTemplates = this.libraryConfigs.flatMap((config) => config.formTemplates ?? []);
  readonly libraryOptions = this.libraryConfigs.map((cfg) => ({ id: cfg.id, label: cfg.label }));

  protected readonly activeLibrarySrc = signal<LibraryConfig | null>(null);
  readonly activeLibrary = this.activeLibrarySrc.asReadonly();
  readonly activeLibraryId = computed(() => this.activeLibrarySrc()?.id ?? null);
  readonly activeLibraryLabel = computed(() => this.activeLibrarySrc()?.label ?? null);

  setActiveLibrary(libraryId: string | null): void {
    if (!libraryId) {
      this.activeLibrarySrc.set(null);
      return;
    }

    const library = this.libraryConfigs.find(({ id }) => id === libraryId);
    if (!library) {
      throw new Error(`Library config with id "${libraryId}" not found.`);
    }

    this.activeLibrarySrc.set(library);
  }

  getLibraryLabel(libraryId: string): string | null {
    const library = this.libraryConfigs.find((cfg) => cfg.id === libraryId);
    return library ? library.label : null;
  }

  getLibrary(libraryId: string): LibraryConfig | null {
    return this.libraryConfigs.find((cfg) => cfg.id === libraryId) ?? null;
  }
}
