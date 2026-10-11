import { inject, Injectable } from '@angular/core';
import { FORMLY_CONFIG, FormlyConfig } from '@ngx-formly/core';
import { CORE_BUILDER_FORM } from './types';
import { CoreLibraryService } from '../config/core-library.service';

@Injectable()
export class FormlyConfigService {
  private readonly libraryService = inject(CoreLibraryService);
  private readonly formlyConfig = inject(FormlyConfig);
  private readonly formlyConfigs = inject(FORMLY_CONFIG, { optional: true });
  private readonly isBuilderForm = inject(CORE_BUILDER_FORM, { optional: true }) ?? false;
  private loadedLibraryId: string | null = null;

  loadLibraryConfigOptions(): void {
    const library = this.libraryService.activeLibrary();
    const libraryId = library?.id ?? null;
    if (this.loadedLibraryId === libraryId) {
      return;
    }

    this.loadedLibraryId = libraryId;
    Object.assign(this.formlyConfig, new FormlyConfig());
    this.formlyConfigs?.forEach((config) => this.formlyConfig.addConfig(config));

    for (const option of library?.configOptions ?? []) {
      this.formlyConfig.addConfig(option);
    }

    if (this.isBuilderForm) {
      for (const option of library?.builderConfigOptions ?? []) {
        this.formlyConfig.addConfig(option);
      }
    }
  }
}
